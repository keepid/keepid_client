package User;

import Config.Message;
import Database.Token.TokenDao;
import Database.User.UserDao;
import User.Services.*;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

@Slf4j
public class UserController {
  MongoDatabase db;
  UserDao userDao;
  TokenDao tokenDao;

  public UserController(UserDao userDao, TokenDao tokenDao, MongoDatabase db) {
    this.userDao = userDao;
    this.tokenDao = tokenDao;
    this.db = db;
  }

  public Handler loginUser =
      ctx -> {
        ctx.req.getSession().invalidate();
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        String password = req.getString("password");
        String ip = ctx.ip();
        String userAgent = ctx.userAgent();
        log.info("Attempting to login " + username);

        LoginService loginService =
            new LoginService(userDao, tokenDao, username, password, ip, userAgent);
        Message response = loginService.executeAndGetResponse();
        log.info(response.toString() + response.getErrorDescription());
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

  public Handler authenticateUser =
      ctx -> {
        String sessionUsername = ctx.sessionAttribute("username");
        AuthenticateUserService authenticateUserService =
            new AuthenticateUserService(userDao, sessionUsername);
        Message response = authenticateUserService.executeAndGetResponse();
        JSONObject responseJSON = response.toJSON();
        if (response == UserMessage.AUTH_SUCCESS) {
          responseJSON.put("username", authenticateUserService.getUsername());
          responseJSON.put("userRole", authenticateUserService.getUserRole());
          responseJSON.put("organization", authenticateUserService.getOrganization());
          responseJSON.put("firstName", authenticateUserService.getFirstName());
          responseJSON.put("lastName", authenticateUserService.getLastName());
          responseJSON.put("twoFactorOn", authenticateUserService.isTwoFactorOn());
        } else {
          responseJSON.put("username", "");
          responseJSON.put("userRole", "");
          responseJSON.put("organization", "");
          responseJSON.put("firstName", "");
          responseJSON.put("lastName", "");
          responseJSON.put("twoFactorOn", "");
        }
        ctx.result(responseJSON.toString());
      };

  public Handler usernameExists =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        CheckUsernameExistsService checkUsernameExistsService =
            new CheckUsernameExistsService(userDao, username);
        ctx.result(checkUsernameExistsService.executeAndGetResponse().toResponseString());
      };

  public Handler createNewUser =
      ctx -> {
        log.info("Starting createNewUser handler");
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

        log.info(sessionUserLevel + " " + organizationName + " " + firstName);

        CreateUserService createUserService =
            new CreateUserService(
                userDao,
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

  public Handler deleteUser =
      ctx -> {
        log.info("Starting deleteUser handler");
        JSONObject req = new JSONObject(ctx.body());
        String sessionUsername = ctx.sessionAttribute("username");
        String password = req.getString("password").strip();
        log.info("Attempting to delete " + sessionUsername);

        DeleteUserService deleteUserService =
            new DeleteUserService(db, userDao, sessionUsername, password);
        Message response = deleteUserService.executeAndGetResponse();
        log.info(response.toString() + response.getErrorDescription());
        ctx.result(response.toJSON().toString());
      };

  public Handler createNewInvitedUser =
      ctx -> {
        log.info("Starting createNewUser handler");
        JSONObject req = new JSONObject(ctx.body());

        String firstName = req.getString("firstname").strip();
        String lastName = req.getString("lastname").strip();
        String birthDate = req.getString("birthDate").strip();
        String email = req.getString("email").strip();
        String phone = req.getString("phonenumber").strip();
        String address = req.getString("address").strip();
        String city = req.getString("city").strip();
        String state = req.getString("state").strip();
        String zipcode = req.getString("zipcode").strip();
        Boolean twoFactorOn = req.getBoolean("twoFactorOn");
        String username = req.getString("username").strip();
        String password = req.getString("password").strip();
        UserType userType = UserType.userTypeFromString(req.getString("personRole").strip());
        String organizationName = req.getString("orgName").strip();

        CreateUserService createUserService =
            new CreateUserService(
                userDao,
                UserType.Director,
                organizationName,
                null,
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
        log.info("Signed out");
        ctx.result(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler getUserInfo =
      ctx -> {
        log.info("Started getUserInfo handler");
        String username;
        try {
          JSONObject req = new JSONObject(ctx.body());
          username = req.getString("username");
        } catch (Exception e) {
          log.info("Username not passed in request, using ctx username");
          username = ctx.sessionAttribute("username");
        }
        GetUserInfoService infoService = new GetUserInfoService(userDao, username);
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
        log.info("Started getMembers handler");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        String searchValue = req.getString("name").trim();
        String orgName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = UserType.userTypeFromString(req.getString("role"));
        String listType = req.getString("listType").toUpperCase();

        GetMembersService getMembersService =
            new GetMembersService(userDao, searchValue, orgName, privilegeLevel, listType);
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
        log.info("Started getLogInHistory handler");
        String username = ctx.sessionAttribute("username");
        LoginHistoryService loginHistoryService = new LoginHistoryService(userDao, username);
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

  public Handler uploadPfp =
      ctx -> {
        String username = ctx.formParam("username");
        String fileName = ctx.formParam("fileName");
        UploadedFile file = ctx.uploadedFile("file");
        log.info(username + " is attempting to upload a profile picture");
        UploadPfpService serv = new UploadPfpService(db, username, file, fileName);
        JSONObject res = serv.executeAndGetResponse().toJSON();
        ctx.result(res.toString());
      };

  public Handler loadPfp =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        LoadPfpService lps = new LoadPfpService(db, username);
        Message mes = lps.executeAndGetResponse();
        if (mes == UserMessage.SUCCESS) {
          ctx.header("Content-Type", "image/" + lps.getContentType());
          ctx.result(lps.getRes());
        } else {
          ctx.result(mes.toJSON().toString());
        }
      };
}
