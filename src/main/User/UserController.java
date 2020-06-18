package User;

import Logger.LogFactory;
import Security.AccountSecurityController;
import Security.EmailUtil;
import Security.Tokens;
import Validation.ValidationException;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Random;

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
        ctx.req.getSession().invalidate();

        System.out.println("BODY: " + ctx.body());

        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String username = req.getString("username");
        String password = req.getString("password");

        res.put("userRole", "");
        res.put("organization", "");
        res.put("firstName", "");
        res.put("lastName", "");

        if (!ValidationUtils.isValidUsername(username)
            || !ValidationUtils.isValidPassword(password)) {
          res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
          ctx.json(res.toString());
          return;
        }

        Argon2 argon2 = Argon2Factory.create();
        char[] passwordArr = password.toCharArray();
        try {
          MongoCollection<User> userCollection = db.getCollection("user", User.class);
          User user = userCollection.find(eq("username", username)).first();
          if (user == null) { // Prevent Brute Force Attack
            res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
            ctx.json(res.toString());
            argon2.wipeArray(passwordArr);
            return;
          }
          String hash = user.getPassword();
          if (argon2.verify(hash, passwordArr)) { // Hash matches password

            UserType userLevel = user.getUserType();
            Boolean twoFactorOn = user.getTwoFactorOn();

            if (twoFactorOn
                && (userLevel == UserType.Director
                    || userLevel == UserType.Admin
                    || userLevel == UserType.Worker)) {

              String randCode = String.format("%06d", new Random().nextInt(999999));
              long nowMillis = System.currentTimeMillis();
              long expMillis = 300000;
              Date expDate = new Date(nowMillis + expMillis);
              String emailContent = AccountSecurityController.getVerificationCodeEmail(randCode);
              Thread emailThread =
                  new Thread(
                      () -> {
                        try {
                          EmailUtil.sendEmail(
                              "Keep Id", user.getEmail(), "Keepid Verification Code", emailContent);

                          MongoCollection<Tokens> tokenCollection =
                              db.getCollection("tokens", Tokens.class);
                          tokenCollection.replaceOne(
                              eq("username", username),
                              new Tokens()
                                  .setUsername(username)
                                  .setTwoFactorCode(randCode)
                                  .setTwoFactorExp(expDate),
                              new ReplaceOptions().upsert(true));
                        } catch (UnsupportedEncodingException e) {
                          e.printStackTrace();
                          ctx.json(
                              res.put(
                                      "status",
                                      UserMessage.SERVER_ERROR.toJSON("Unsupported email encoding"))
                                  .toString());
                          return;
                        }
                      });
              emailThread.start();

              res.put("status", UserMessage.TOKEN_ISSUED.getErrorName());
              res.put("userRole", user.getUserType());
              res.put("organization", user.getOrganization());
              res.put("firstName", user.getFirstName());
              res.put("lastName", user.getLastName());
              res.put("twoFactorOn", twoFactorOn);
              ctx.json(res.toString());
              return;
            }

            ctx.sessionAttribute("privilegeLevel", user.getUserType());
            ctx.sessionAttribute("orgName", user.getOrganization());
            ctx.sessionAttribute("username", username);

            res.put("status", UserMessage.AUTH_SUCCESS.getErrorName());
            res.put("userRole", user.getUserType());
            res.put("organization", user.getOrganization());
            res.put("firstName", user.getFirstName());
            res.put("lastName", user.getLastName());
            res.put("twoFactorOn", twoFactorOn);
            ctx.json(res.toString());
          } else { // Hash doesn't match password
            res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
            ctx.json(res.toString());
          }
        } catch (Exception e) { // catch exceptions
          e.printStackTrace();
          res.put("status", UserMessage.HASH_FAILURE.getErrorName());
          ctx.json(res.toString());
        } finally {
          argon2.wipeArray(passwordArr); // Wipe confidential data from cache
        }
      };

  public Handler generateUniqueUsername =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        String username = req.getString("username");
        String candidateUsername = username;
        int i = 0;
        while (userCollection.find(eq("username", candidateUsername)).first() != null && i < 1000) {
          i++;
          candidateUsername = username + "-" + i;
        }
        ctx.json(res.put("username", candidateUsername).toString());
      };

  public Handler createUserValidator =
      ctx -> {
        String sessionOrg = ctx.sessionAttribute("orgName");

        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        String firstName = req.getString("firstname").toUpperCase().strip();
        String lastName = req.getString("lastname").toUpperCase().strip();
        String birthDate = req.getString("birthDate").strip();
        String email = req.getString("email").toLowerCase().strip();
        String phone = req.getString("phonenumber").strip();
        String address = req.getString("address").toUpperCase().strip();
        String city = req.getString("city").toUpperCase().strip();
        String state = req.getString("state").toUpperCase().strip();
        String zipcode = req.getString("zipcode").strip();
        Boolean twoFactorOn = req.getBoolean("twoFactorOn");
        String username = req.getString("username").strip();
        String password = req.getString("password").strip();
        String userTypeString = req.getString("personRole").strip();
        UserType userType = UserType.userTypeFromString(userTypeString);

        if (userType == null) {
          ctx.json(res.put("status", UserMessage.INVALID_PRIVILEGE_TYPE.toJSON()).toString());
          return;
        }

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", username)).first();

        if (existingUser != null) {
          ctx.json(res.put("status", UserMessage.USERNAME_ALREADY_EXISTS.toJSON()).toString());
          return;
        }

        try {
          new User(
              firstName,
              lastName,
              birthDate,
              email,
              phone,
              sessionOrg,
              address,
              city,
              state,
              zipcode,
              twoFactorOn,
              username,
              password,
              userType);
          ctx.json(
              res.put(
                      "status",
                      UserValidationMessage.toUserMessageJSON(UserValidationMessage.VALID))
                  .toString());
        } catch (ValidationException ve) {
          ctx.json(res.put("status", ve.getMessage()).toString());
        }
      };

  public Handler createNewUser =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        UserType sessionUserLevel = ctx.sessionAttribute("privilegeLevel");
        String sessionOrg = ctx.sessionAttribute("orgName");

        if (sessionUserLevel == null || sessionOrg == null) {
          ctx.json(res.put("status", UserMessage.SESSION_TOKEN_FAILURE.toJSON()).toString());
          return;
        }

        String firstName = req.getString("firstname").toUpperCase().strip();
        String lastName = req.getString("lastname").toUpperCase().strip();
        String birthDate = req.getString("birthDate").strip();
        String email = req.getString("email").toLowerCase().strip();
        String phone = req.getString("phonenumber").strip();
        String address = req.getString("address").toUpperCase().strip();
        String city = req.getString("city").toUpperCase().strip();
        String state = req.getString("state").toUpperCase().strip();
        String zipcode = req.getString("zipcode").strip();
        Boolean twoFactorOn = req.getBoolean("twoFactorOn");
        String username = req.getString("username").strip();
        String password = req.getString("password").strip();
        String userTypeString = req.getString("personRole").strip();
        UserType userType = UserType.userTypeFromString(userTypeString);

        if (userType == null) {
          ctx.json(res.put("status", UserMessage.INVALID_PRIVILEGE_TYPE.toJSON()).toString());
          return;
        }

        User user;
        try {
          user =
              new User(
                  firstName,
                  lastName,
                  birthDate,
                  email,
                  phone,
                  sessionOrg,
                  address,
                  city,
                  state,
                  zipcode,
                  twoFactorOn,
                  username,
                  password,
                  userType);
        } catch (ValidationException ve) {
          ctx.json(res.put("status", ve.getMessage()).toString());
          return;
        }

        if ((user.getUserType() == UserType.Director
                || user.getUserType() == UserType.Admin
                || user.getUserType() == UserType.Worker)
            && sessionUserLevel != UserType.Admin
            && sessionUserLevel != UserType.Director) {
          ctx.json(res.put("status", UserMessage.NONADMIN_ENROLL_ADMIN.toJSON()).toString());
          return;
        }

        if (user.getUserType() == UserType.Client && sessionUserLevel == UserType.Client) {
          ctx.json(res.put("status", UserMessage.CLIENT_ENROLL_CLIENT.toJSON()).toString());
          return;
        }

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", user.getUsername())).first();

        if (existingUser != null) {
          ctx.json(res.put("status", UserMessage.USERNAME_ALREADY_EXISTS.toJSON()).toString());
          return;
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = user.getPassword().toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(res.put("status", UserMessage.HASH_FAILURE.toJSON()).toString());
            return;
          }

          user.setPassword(passwordHash);
          userCollection.insertOne(user);
          ctx.json(res.put("status", UserMessage.ENROLL_SUCCESS.toJSON()).toString());
        }
      };

  public Handler logout =
      ctx -> {
        ctx.req.getSession().invalidate();
        ctx.json(new JSONObject().put("status", UserMessage.SUCCESS.getErrorName()).toString());
      };

  public Handler getUserInfo =
      ctx -> {
        JSONObject res = new JSONObject();
        String username = ctx.sessionAttribute("username");
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();
        if (user != null) {
          res.put("userRole", user.getUserType());
          res.put("organization", user.getOrganization());
          res.put("firstName", user.getFirstName());
          res.put("lastName", user.getLastName());
          res.put("birthDate", user.getBirthDate());
          res.put("address", user.getAddress());
          res.put("city", user.getCity());
          res.put("state", user.getState());
          res.put("zipcode", user.getZipcode());
          res.put("email", user.getEmail());
          res.put("phone", user.getPhone());
          res.put("twoFactorOn", user.getTwoFactorOn());
          res.put("username", username);
          res.put("status", UserMessage.SUCCESS.getErrorName());
          ctx.json(res.toString());
        } else {
          ctx.json(res.put("status", UserMessage.SESSION_TOKEN_FAILURE.toJSON()).toString());
        }
      };

  public Handler getMembers =
      ctx -> {
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String orgName = ctx.sessionAttribute("orgName");

        JSONObject req = new JSONObject(ctx.body());
        String nameSearch = req.getString("name").trim();
        String[] nameSearchSplit = nameSearch.split(" ");
        String listType = req.getString("listType");
        int currentPage = req.getInt("currentPage");
        int itemsPerPage = req.getInt("itemsPerPage");
        int startIndex = currentPage * itemsPerPage;
        int endIndex = (currentPage + 1) * itemsPerPage;

        JSONObject res = new JSONObject();

        if (privilegeLevel == null || orgName == null) {
          ctx.json(res.put("status", UserMessage.SESSION_TOKEN_FAILURE.toJSON()).toString());
          return;
        }

        JSONArray members = new JSONArray();
        JSONArray clients = new JSONArray();
        MongoCollection<User> userCollection = db.getCollection("user", User.class);

        Bson orgNameMatch = eq("organization", orgName);
        Bson filter;

        if (!nameSearch.contentEquals("")) {
          filter = regex("firstName", nameSearchSplit[0], "i");
          filter = or(filter, regex("lastName", nameSearchSplit[0], "i"));
          for (int i = 1; i < nameSearchSplit.length; i++) {
            filter = or(filter, regex("firstName", nameSearchSplit[i], "i"));
            filter = or(filter, regex("lastName", nameSearchSplit[i], "i"));
          }
          filter = combine(filter, orgNameMatch);
        } else {
          filter = orgNameMatch;
        }

        MongoCursor<User> cursor = userCollection.find(filter).iterator();
        int numClients = 0;
        int numMembers = 0;
        while (cursor.hasNext()) {
          User user = cursor.next();

          JSONObject userJSON = new JSONObject();
          userJSON.put("username", user.getUsername());
          userJSON.put("privilegeLevel", user.getUserType());
          userJSON.put("firstName", user.getFirstName());
          userJSON.put("lastName", user.getLastName());
          userJSON.put("email", user.getEmail());
          userJSON.put("phone", user.getPhone());
          userJSON.put("address", user.getAddress());
          userJSON.put("city", user.getCity());
          userJSON.put("state", user.getState());
          userJSON.put("zipcode", user.getZipcode());

          UserType userType = user.getUserType();

          if (userType == UserType.Director
              || userType == UserType.Admin
              || userType == UserType.Worker) {
            members.put(userJSON);
            numMembers += 1;
          } else if (userType == UserType.Client) {
            clients.put(userJSON);
            numClients += 1;
          }
        }

        JSONArray returnElements;
        int numReturnElements;
        // If Getting Client List
        if (listType.equals("clients")
            && (privilegeLevel == UserType.Worker
                || privilegeLevel == UserType.Admin
                || privilegeLevel == UserType.Director)) {
          returnElements = getPage(clients, startIndex, endIndex);
          numReturnElements = clients.length();
          // If Getting Worker/Admin List
        } else if (listType.equals("members") && privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director) {
          returnElements = getPage(members, startIndex, endIndex);
          numReturnElements = members.length();
        } else {
          ctx.json(res.put("status", UserMessage.INSUFFICIENT_PRIVILEGE.toJSON()).toString());
          return;
        }

        res.put("status", UserMessage.SUCCESS.getErrorName());
        res.put("message", UserMessage.SUCCESS.getErrorDescription());
        res.put("people", returnElements);
        res.put("numPeople", numReturnElements);
        ctx.json(res.toString());
      };

  public Handler modifyPermissions =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String orgName = ctx.sessionAttribute("orgName");

        JSONObject res = new JSONObject();

        if (username == null || privilegeLevel == null || orgName == null) {
          ctx.json(res.put("status", UserMessage.SESSION_TOKEN_FAILURE.toJSON()).toString());
          return;
        }

        if (!(privilegeLevel == UserType.Director || privilegeLevel == UserType.Admin)) {
          ctx.json(UserMessage.INSUFFICIENT_PRIVILEGE.toJSON());
          return;
        }

        JSONObject req = new JSONObject(ctx.body());
        boolean canView = req.getBoolean("canView");
        boolean canEdit = req.getBoolean("canEdit");
        boolean canRegister = req.getBoolean("canRegister");

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        Bson filter = eq("username", username);
        Bson updateCanView = set("canView", canView);
        Bson updateCanEdit = set("canEdit", canEdit);
        Bson updateCanRegister = set("canRegister", canRegister);
        Bson updates = combine(updateCanView, updateCanEdit, updateCanRegister);
        userCollection.findOneAndUpdate(filter, updates);

        ctx.json(res.put("status", UserMessage.SUCCESS.toJSON()).toString());
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
