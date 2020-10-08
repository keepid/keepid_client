package User;

import Bug.BugController;
import Config.Message;
import Logger.LogFactory;
import Security.*;
import User.Services.*;
import Validation.ValidationException;
import Validation.ValidationUtils;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;
import org.slf4j.Logger;

import static com.mongodb.client.model.Filters.eq;

public class UserController {
  Logger logger;
  MongoDatabase db;
  EncryptionUtils encryptionUtils;
  BugController bugController;

  public UserController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("UserController");
    this.encryptionUtils = EncryptionUtils.getInstance();
    this.bugController = new BugController(db);
    logger = (new LogFactory()).createLogger("UserController");
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
        if (response == UserMessage.AUTH_SUCCESS) {
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
          ctx.result(
              UserValidationMessage.toUserMessageJSON(UserValidationMessage.VALID).toString());
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

        CreateUserService createUserService =
            new CreateUserService(
                db,
                logger,
                sessionUserLevel,
                organizationName,
                sessionUsername,
                firstName,
                lastName,
                birthDate,
                email,
                phone,
                address,
                city,
                state,
                zipcode,
                twoFactorOn,
                username,
                password,
                userType);
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
        String username = ctx.sessionAttribute("username");
        GetUserInfoService infoService = new GetUserInfoService(db, logger, username);
        Message response = infoService.executeAndGetResponse();
        if (response != UserMessage.SUCCESS) { // if fail return
          ctx.result(response.toJSON().toString());
        } else {
          JSONObject userInfo = infoService.getUserFields(); // get user info here
          JSONObject mergedInfo = mergeJSON(response.toJSON(), userInfo);
          ctx.result(mergedInfo.toString());
        }
      };

  public Handler getMembers =
      ctx -> {
        logger.info("Started getMembers handler");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        String searchValue = req.getString("name").trim();
        String orgName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        String listType = req.getString("listType").toUpperCase();
        int currentPage = req.getInt("currentPage");
        int itemsPerPage = req.getInt("itemsPerPage");

        GetMembersService getMembersService =
            new GetMembersService(
                db,
                logger,
                searchValue,
                orgName,
                privilegeLevel,
                listType,
                currentPage,
                itemsPerPage);
        Message message = getMembersService.executeAndGetResponse();
        if (message == UserMessage.SUCCESS) {
          res.put("people", getMembersService.getPeoplePage());
          res.put("numPeople", getMembersService.getNumReturnedElements());
          ctx.result(mergeJSON(res, message.toJSON()).toString());
        } else {
          ctx.result(message.toResponseString());
        }
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
      ]
   }
  */
  public Handler getLogInHistory =
      ctx -> {
        logger.info("Started getLogInHistory handler");
        String username = ctx.sessionAttribute("username");
        LoginHistoryService loginHistoryService = new LoginHistoryService(db, logger, username);
        Message responseMessage = loginHistoryService.executeAndGetResponse();
        JSONObject res = responseMessage.toJSON();
        if (responseMessage == UserMessage.SUCCESS) {
          res.put("username", loginHistoryService.getUsername());
          res.put("history", loginHistoryService.getLoginHistoryArray());
        }
        ctx.result(res.toString());
      };

  public static JSONObject mergeJSON(
      JSONObject object1, JSONObject object2) { // helper function to merge 2 json objects
    JSONObject merged = new JSONObject(object1, JSONObject.getNames(object1));
    for (String key : JSONObject.getNames(object2)) {
      merged.put(key, object2.get(key));
    }
    return merged;
  }
}
