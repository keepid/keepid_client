package UserIntTests;

import Config.MongoConfig;
import Logger.LogFactory;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

public class UserController {
  Logger logger;
  MongoDatabase db;

  public UserController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("UserController");
  }

  public Handler loginUser =
      ctx -> {
        // ctx.req.changeSessionId();
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String username = req.getString("username");
        String password = req.getString("password");
        Argon2 argon2 = Argon2Factory.create();
        // @validate make sure that username and password are not null
        char[] passwordArr = password.toCharArray();
        try {
          // retrieve hash from database
          // do mongodb lookup here
          MongoClient client = MongoConfig.getMongoClient();
          MongoDatabase database = client.getDatabase(MongoConfig.getDatabaseName());
          MongoCollection<Document> userCollection = database.getCollection("user");
          Document user = userCollection.find(eq("username", username)).first();
          if (user == null) {
            res.put("loginStatus", UserMessage.USER_NOT_FOUND.getErrorName());
            res.put("userRole", "");
            ctx.json(res.toString());
            argon2.wipeArray(passwordArr);
            return;
          }

          String hash = user.get("password", String.class);
          if (argon2.verify(hash, passwordArr)) {
            // Hash matches password

            ctx.sessionAttribute("privilegeLevel", user.get("privilegeLevel"));
            ctx.sessionAttribute("orgName", user.get("organization"));
            ctx.sessionAttribute("username", username);
            logger.error("PUT SESSION LEVEL: " + ctx.sessionAttribute("privilegeLevel"));
            logger.error("PUT SESSION NAME: " + ctx.sessionAttribute("orgName"));

            res.put("loginStatus", UserMessage.AUTH_SUCCESS.getErrorName());
            res.put("userRole", user.get("privilegeLevel"));
            res.put("organization", user.get("organization"));
            res.put("firstName", user.get("firstName"));
            res.put("lastName", user.get("lastName"));
            ctx.json(res.toString());
          } else {
            // Hash doesn't match password
            res.put("loginStatus", UserMessage.AUTH_FAILURE.getErrorName());
            res.put("userRole", "");
            res.put("organization", "");
            res.put("firstName", "");
            res.put("lastName", "");
            ctx.json(res.toString());
          }
        } catch (Exception e) {
          res.put("loginStatus", UserMessage.HASH_FAILURE.getErrorName());
          res.put("userRole", "");
          res.put("organization", "");
          res.put("firstName", "");
          res.put("lastName", "");
          ctx.json(res.toString());
        } finally {
          // Wipe confidential data from cache
          argon2.wipeArray(passwordArr);
        }
      };

  public Handler createNewUser =
      ctx -> {

        // System.out.println("SESSION: " + ctx.req.getSession().toString());
        JSONObject req = new JSONObject(ctx.body());
        // Get all formParams
        String firstName = req.getString("firstname");
        String lastName = req.getString("lastname");
        String email = req.getString("email");
        String phonenumber = req.getString("phonenumber");
        String address = req.getString("address");
        String city = req.getString("city");
        String state = req.getString("state");
        String zipcode = req.getString("zipcode");
        String username = req.getString("username");
        String password = req.getString("password");
        String userLevel = req.getString("personRole");

        // Session attributes.
        String sessionUserLevel = ctx.sessionAttribute("privilegeLevel");
        String sessionOrg = ctx.sessionAttribute("orgName");

        if (sessionUserLevel == null || sessionOrg == null) {
          System.out.println(sessionUserLevel);
          System.out.println(sessionOrg);
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.getErrorName());
          return;
        }

        if (userLevel.equals("admin") && !sessionUserLevel.equals("admin")) {
          ctx.json(new JSONObject(UserMessage.NONADMIN_ENROLL_ADMIN.getErrorName()));
          return;
        }

        if (userLevel.equals("worker") && !sessionUserLevel.equals("admin")) {
          ctx.json(new JSONObject(UserMessage.NONADMIN_ENROLL_WORKER.getErrorName()));
          return;
        }

        if (userLevel.equals("client") && sessionUserLevel.equals("client")) {
          ctx.json(new JSONObject(UserMessage.CLIENT_ENROLL_CLIENT.getErrorName()));
          return;
        }

        MongoDatabase database =
            MongoConfig.getMongoClient().getDatabase(MongoConfig.getDatabaseName());

        MongoCollection<Document> userCollection = database.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingUser != null) {
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
          return;
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = password.toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(UserMessage.HASH_FAILURE.getErrorName());
            return;
          }

          Document newUser =
              new Document("username", username)
                  .append("password", passwordHash)
                  .append("organization", sessionOrg)
                  .append("email", email)
                  .append("phone", phonenumber)
                  .append("firstName", firstName.toUpperCase())
                  .append("lastName", lastName.toUpperCase())
                  .append("address", address.toUpperCase())
                  .append("city", city.toUpperCase())
                  .append("state", state)
                  .append("zipcode", zipcode)
                  .append("privilegeLevel", userLevel)
                  .append("canView", userLevel.equals("admin"))
                  .append("canEdit", userLevel.equals("admin"))
                  .append("canRegister", userLevel.equals("admin"));
          userCollection.insertOne(newUser);

          ctx.json(UserMessage.ENROLL_SUCCESS.getErrorName());
        }
      };

  public Handler logout =
      ctx -> {
        ctx.req.getSession().invalidate();
        ctx.json("SUCCESS");
      };

  public Handler getMembers =
      ctx -> {
        String privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String orgName = ctx.sessionAttribute("orgName");

        JSONObject req = new JSONObject(ctx.body());
        String nameSearch = req.getString("name").trim();
        String[] nameSearchSplit = nameSearch.split(" ");
        String listType = req.getString("listType");
        int currentPage = req.getInt("currentPage");
        int itemsPerPage = req.getInt("itemsPerPage");
        int startIndex = currentPage * itemsPerPage;
        int endIndex = (currentPage + 1) * itemsPerPage;

        if (privilegeLevel == null || orgName == null) {
          JSONObject response = new JSONObject();
          response.put("status", UserMessage.SESSION_TOKEN_FAILURE.getErrorName());
          ctx.json(response.toString());
          return;
        }

        JSONObject memberList = new JSONObject();

        JSONArray members = new JSONArray();
        JSONArray clients = new JSONArray();

        MongoClient client = MongoConfig.getMongoClient();
        MongoDatabase database = client.getDatabase(MongoConfig.getDatabaseName());
        MongoCollection<Document> userCollection = database.getCollection("user");

        Bson orgNameMatch = eq("organization", orgName);
        Bson filter;

        if (!nameSearch.contentEquals("")) {
          filter = regex("firstName", nameSearchSplit[0], "i");
          filter = or(filter, regex("lastName", nameSearchSplit[0], "i"));
          for (int i = 1; i < nameSearchSplit.length; i++) {
            filter = or(filter, regex("firstName", nameSearchSplit[i], "i"));
            filter = or(filter, regex("lastName", nameSearchSplit[i], "i"));
          }
          filter = combine(filter, orgNameMatch); // Make sure good
        } else {
          filter = orgNameMatch;
        }

        MongoCursor<Document> cursor = userCollection.find(filter).iterator();
        int numClients = 0;
        int numMembers = 0;
        while (cursor.hasNext()) {
          System.out.println("NEXT CURSOR");
          Document doc = cursor.next();
          String userType = doc.get("privilegeLevel").toString();

          System.out.println(userType);

          JSONObject user = new JSONObject();
          user.put("username", doc.get("username").toString());
          user.put("privilegeLevel", doc.get("privilegeLevel").toString());
          user.put("firstName", doc.get("firstName").toString());
          user.put("lastName", doc.get("lastName").toString());
          user.put("email", doc.get("email").toString());
          user.put("phone", doc.get("phone").toString());
          user.put("address", doc.get("address").toString());
          user.put("city", doc.get("city").toString());
          user.put("state", doc.get("state").toString());
          user.put("zipcode", doc.get("zipcode").toString());

          if (userType.equals("admin") || userType.equals("worker")) {
            members.put(user);
            numMembers += 1;
          } else if (userType.equals("client")) {
            clients.put(user);
            numClients += 1;
          }
        }

        JSONArray returnElements;
        int numReturnElements;
        // If Getting Client List
        if (listType.equals("clients")
            && (privilegeLevel.equals("worker") || privilegeLevel.equals("admin"))) {
          returnElements = getPage(clients, startIndex, endIndex);
          numReturnElements = clients.length();
          // If Getting Worker/Admin List
        } else if (listType.equals("members") && privilegeLevel.equals("admin")) {
          returnElements = getPage(members, startIndex, endIndex);
          numReturnElements = members.length();
        } else {
          JSONObject response = new JSONObject();
          response.put("status", UserMessage.INSUFFICIENT_PRIVILEGE.getErrorName());
          ctx.json(response.toString());
          return;
        }

        JSONObject response = new JSONObject();
        response.put("people", returnElements);
        response.put("numPeople", numReturnElements);
        ctx.json(response.toString());
      };

  public Handler modifyPermissions =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String orgName = ctx.sessionAttribute("orgName");

        if (username == null || privilegeLevel == null || orgName == null) {
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.getErrorName());
          return;
        }

        if (!privilegeLevel.equals("admin")) {
          ctx.json(UserMessage.INSUFFICIENT_PRIVILEGE.getErrorName());
          return;
        }

        JSONObject req = new JSONObject(ctx.body());
        boolean canView = req.getBoolean("canView");
        boolean canEdit = req.getBoolean("canEdit");
        boolean canRegister = req.getBoolean("canRegister");

        MongoDatabase database =
            MongoConfig.getMongoClient().getDatabase(MongoConfig.getDatabaseName());
        MongoCollection<Document> userCollection = database.getCollection("user");
        Bson filter = eq("username", username);
        Bson updateCanView = set("canView", canView);
        Bson updateCanEdit = set("canEdit", canEdit);
        Bson updateCanRegister = set("canRegister", canRegister);
        Bson updates = combine(updateCanView, updateCanEdit, updateCanRegister);
        userCollection.findOneAndUpdate(filter, updates);

        ctx.json(UserMessage.SUCCESS.getErrorName());
      };

  private JSONArray getPage(JSONArray elements, int pageStartIndex, int pageEndIndex) {
    JSONArray page = new JSONArray();
    if (elements.length() > pageStartIndex && pageStartIndex >= 0) {
      if (pageEndIndex > elements.length()) {
        pageEndIndex = elements.length();
      }
      for (int i = pageStartIndex; i < pageEndIndex; i++) {
        page.put(elements.get(i));
      }
    } else {
      System.out.println("ERROR: Invalid Start Index");
    }
    return page;
  }
}
