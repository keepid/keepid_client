package User;

import Activity.*;
import Bug.BugController;
import Config.Message;
import Logger.LogFactory;
import Security.EmailExceptions;
import Security.EmailUtil;
import Security.SecurityUtils;
import Security.Tokens;
import Validation.ValidationException;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.List;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

public class UserController {
  Logger logger;
  MongoDatabase db;
  BugController bugController;

  public UserController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    this.bugController = new BugController(db);
    logger = l.createLogger("UserController");
  }

  public Handler loginUser =
    ctx -> {
      ctx.req.getSession().invalidate();
      JSONObject req = new JSONObject(ctx.body());
      String username = req.getString("username");
      String password = req.getString("password");
      String ip = ctx.ip();
      String userAgent = ctx.userAgent();
      logger.info("Attempting to login " + username);

      LoginService loginService = new LoginService(db, logger, username, password, ip, userAgent);
      Message response = loginService.executeAndGetResponse();
      logger.info(response.toString() + response.getErrorDescription());
      JSONObject responseJSON = response.toJSON();
      if(response == UserMessage.AUTH_SUCCESS){
        responseJSON.put("userRole", loginService.getUserRole());
        responseJSON.put("organization", loginService.getOrganization());
        responseJSON.put("firstName", loginService.getFirstName());
        responseJSON.put("lastName", loginService.getLastName());
        responseJSON.put("twoFactorOn", loginService.isTwoFactorOn());

        ctx.sessionAttribute("privilegeLevel", loginService.getUserRole());
        ctx.sessionAttribute("orgName", loginService.getOrganization());
        ctx.sessionAttribute("username", loginService.getUsername());
        ctx.sessionAttribute("fullName", loginService.getFullName());
      } else {
        responseJSON.put("userRole", "");
        responseJSON.put("organization", "");
        responseJSON.put("firstName", "");
        responseJSON.put("lastName", "");
        responseJSON.put("twoFactorOn", "");
      }
      ctx.result(responseJSON.toString());
    };

//  UNUSED
  public Handler generateUniqueUsername =
      ctx -> {
        logger.info("Starting generateUniqueUsername Handler");
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
        logger.info("Username successfully generated");
      };

  public Handler createUserValidator =
      ctx -> {
        logger.info("Starting createUserValidator handler");
        JSONObject req = new JSONObject(ctx.body());

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
          logger.error("userType is null");
          ctx.result(UserMessage.INVALID_PRIVILEGE_TYPE.toJSON().toString());
          return;
        }

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", username)).first();

        if (existingUser != null) {
          logger.error("Username already exists");
          ctx.result(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().toString());
          return;
        }

        try {
          logger.info("Attempting to validate user");
          new User(
              firstName,
              lastName,
              birthDate,
              email,
              phone,
              "",
              address,
              city,
              state,
              zipcode,
              twoFactorOn,
              username,
              password,
              userType);
          logger.info("Validating user success");
          ctx.result(UserValidationMessage.toUserMessageJSON(UserValidationMessage.VALID).toString());
        } catch (ValidationException ve) {
          logger.error("Validation exception");
          ctx.result(ve.getJSON().toString());
        }
      };

  public Handler createNewUser =
    ctx -> {
      logger.info("Starting createNewUser handler");
      JSONObject req = new JSONObject(ctx.body());
      UserType sessionUserLevel = ctx.sessionAttribute("privilegeLevel");
      String organizationName = ctx.sessionAttribute("orgName");
      String sessionUsername = ctx.sessionAttribute("username");
      String firstName = req.getString("firstname").strip();
      String lastName = req.getString("lastname").strip();
      String birthDate = req.getString("birthDate").strip();
      String email = req.getString("email").toLowerCase().strip();
      String phone = req.getString("phonenumber").strip();
      String address = req.getString("address").strip();
      String city = req.getString("city").strip();
      String state = req.getString("state").strip();
      String zipcode = req.getString("zipcode").strip();
      Boolean twoFactorOn = req.getBoolean("twoFactorOn");
      String username = req.getString("username").strip();
      String password = req.getString("password").strip();
      String userTypeString = req.getString("personRole").strip();
      UserType userType = UserType.userTypeFromString(userTypeString);

      CreateUserService createUserService = new CreateUserService(db, logger, sessionUserLevel, organizationName,
              sessionUsername, firstName, lastName, birthDate, email, phone, address, city, state, zipcode,
              twoFactorOn, username, password, userType);
      Message response = createUserService.executeAndGetResponse();
      ctx.result(response.toJSON().toString());
    };

  public Handler logout =
      ctx -> {
        ctx.req.getSession().invalidate();
        logger.info("Signed out");
        ctx.result(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler getUserInfo =
      ctx -> {
        logger.info("Started getUserInfo handler");
        JSONObject res = new JSONObject();
        String username = ctx.sessionAttribute("username");
        GetUserInfoService infoService = new GetUserInfoService(db, logger, username);
        Message response = infoService.executeAndGetResponse();
        if(response != UserMessage.SUCCESS){ // if fail return
          ctx.result(response.toJSON().toString());
        } else {
          JSONObject userInfo = infoService.getUserFields(); // get user info here
          JSONObject mergedInfo = mergeJSON(response.toJSON(), userInfo);
          ctx.result(mergedInfo.toString());
        }
      };

  private JSONObject mergeJSON(JSONObject object1, JSONObject object2){ // helper function to merge 2 json objects
    JSONObject merged = new JSONObject(object1, JSONObject.getNames(object1));
    for(String key : JSONObject.getNames(object2)) {
      merged.put(key, object2.get(key));
    }
    return merged;
  }

  public Handler getMembers =
      ctx -> {
        logger.info("Started getMembers handler");
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
          logger.error("Session Token Failure");
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
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

          logger.info("Getting member information");
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
          logger.error("Insufficient Privilege, Could not return member info");
          ctx.json(UserMessage.INSUFFICIENT_PRIVILEGE.toJSON().toString());
          return;
        }

        res.put("status", UserMessage.SUCCESS.getErrorName());
        res.put("message", UserMessage.SUCCESS.getErrorDescription());
        res.put("people", returnElements);
        res.put("numPeople", numReturnElements);
        ctx.json(res.toString());
        logger.info("Successfully returned member information");
      };
  /*
   Returned JSON format:
       {“username”: “username”,
              "history": [
                     {
                         “date”:”month/day/year, hour:min, Local Time”,
                         “device”:”Mobile” or "Computer",
                         “IP”:”exampleIP”,
                         “location”: “Postal, City”,
                     }
        ]08/233/2020dorm
     }
  */
  public Handler getLogInHistory =
      ctx -> {
        logger.info("Started getLogInHistory handler");
        JSONArray res = new JSONArray();
        String username = ctx.sessionAttribute("username");
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();
        if (user != null) {
          List<IpObject> logIns = user.getLogInHistory();
          for (IpObject login : logIns) {
            JSONObject oneLog = new JSONObject();
            oneLog.put("IP", login.getIp());
            oneLog.put("date", login.getDate());
            oneLog.put("location", login.getLocation());
            oneLog.put("device", login.getDevice());
            res.put(oneLog);
          }
          JSONObject actual = new JSONObject();
          actual.put("username", username);
          actual.put("history", res);
          ctx.json(actual.toString());
          logger.info("Retrieved login history successfully");
        } else {
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
          logger.error("Session Token Failure");
        }
      };

  public Handler modifyPermissions =
      ctx -> {
        logger.info("Starting modifyPermissions handler");
        String username = ctx.sessionAttribute("username");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String orgName = ctx.sessionAttribute("orgName");

        JSONObject res = new JSONObject();

        if (username == null || privilegeLevel == null || orgName == null) {
          logger.error("Session token failure");
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
          return;
        }

        if (!(privilegeLevel == UserType.Director || privilegeLevel == UserType.Admin)) {
          logger.error("Insufficient privilege");
          ctx.json(UserMessage.INSUFFICIENT_PRIVILEGE.toJSON().toString());
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

        logger.info("Successfully modified permissions for " + username);
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  private static JSONArray getPage(JSONArray elements, int pageStartIndex, int pageEndIndex) {
    JSONArray page = new JSONArray();
    if (elements.length() > pageStartIndex && pageStartIndex >= 0) {
      if (pageEndIndex > elements.length()) {
        pageEndIndex = elements.length();
      }
      for (int i = pageStartIndex; i < pageEndIndex; i++) {
        page.put(elements.get(i));
      }
    }
    return page;
  }
}
