package User;

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
import com.mongodb.client.model.ReplaceOptions;
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

  public Handler loginUser(SecurityUtils securityUtils, EmailUtil emailUtil) {
    return ctx -> {
      ctx.req.getSession().invalidate();
      JSONObject req = new JSONObject(ctx.body());
      JSONObject res = new JSONObject();
      String username = req.getString("username");
      String password = req.getString("password");

      logger.info("Attempting to login" + username);

      res.put("userRole", "");
      res.put("organization", "");
      res.put("firstName", "");
      res.put("lastName", "");

      if (!ValidationUtils.isValidUsername(username)
          || !ValidationUtils.isValidPassword(password)) {
        logger.error("Invalid username and/or password");
        res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
        ctx.json(res.toString());
        return;
      }

      MongoCollection<User> userCollection = db.getCollection("user", User.class);
      User user = userCollection.find(eq("username", username)).first();
      if (user == null) {
        logger.error("Could not find user, " + username);
        res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
        ctx.json(res.toString());
        return;
      }

      SecurityUtils.PassHashEnum verifyPasswordStatus =
          securityUtils.verifyPassword(password, user.getPassword());

      if (verifyPasswordStatus == SecurityUtils.PassHashEnum.ERROR) {
        logger.error("Failed to hash password");
        res.put("status", UserMessage.HASH_FAILURE.getErrorName());
        ctx.json(res.toString());
      } else if (verifyPasswordStatus == SecurityUtils.PassHashEnum.FAILURE) {
        logger.error("Incorrect password");
        res.put("status", UserMessage.AUTH_FAILURE.getErrorName());
        ctx.json(res.toString());
        return;
      }

      UserType userLevel = user.getUserType();
      Boolean twoFactorOn = user.getTwoFactorOn();

      if (twoFactorOn
          && (userLevel == UserType.Director
              || userLevel == UserType.Admin
              || userLevel == UserType.Worker)) {
        logger.info("Two factor authentication process");
        String randCode = String.format("%06d", new Random().nextInt(999999));
        long nowMillis = System.currentTimeMillis();
        long expMillis = 300000;
        Date expDate = new Date(nowMillis + expMillis);
        Thread emailThread =
            new Thread(
                () -> {
                  try {
                    String emailContent = emailUtil.getVerificationCodeEmail(randCode);
                    emailUtil.sendEmail(
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
                  } catch (EmailExceptions e) {
                    logger.error("Could not send email");
                    ctx.json(e.toJSON().toString());
                    return;
                  } catch (UnsupportedEncodingException e) {
                    logger.error("Unsupported encoding");
                    e.printStackTrace();
                    JSONObject serverErrorJSON =
                        UserMessage.SERVER_ERROR.toJSON("Unsupported email encoding");
                    ctx.json(res.put("status", serverErrorJSON.getString("status")).toString());
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
        logger.info("Two Factor email sent to " + user.getEmail());
        return;
      }

      String fullName = user.getFirstName() + " " + user.getLastName();
      ctx.sessionAttribute("privilegeLevel", user.getUserType());
      ctx.sessionAttribute("orgName", user.getOrganization());
      ctx.sessionAttribute("username", username);
      ctx.sessionAttribute("fullName", fullName);

      res.put("status", UserMessage.AUTH_SUCCESS.getErrorName());
      res.put("userRole", user.getUserType());
      res.put("organization", user.getOrganization());
      res.put("firstName", user.getFirstName());
      res.put("lastName", user.getLastName());
      res.put("twoFactorOn", twoFactorOn);
      ctx.json(res.toString());
      logger.info("Login Successful!");
    };
  }

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
          ctx.json(UserMessage.INVALID_PRIVILEGE_TYPE.toJSON().toString());
          return;
        }

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", username)).first();

        if (existingUser != null) {
          logger.error("Username already exists");
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().toString());
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
          ctx.json(UserValidationMessage.toUserMessageJSON(UserValidationMessage.VALID).toString());
        } catch (ValidationException ve) {
          logger.error("Validation exception");
          ctx.json(ve.getJSON().toString());
        }
      };

  public Handler createNewUser(SecurityUtils securityUtils) {
    return ctx -> {
      logger.info("Starting createNewUser handler");
      JSONObject req = new JSONObject(ctx.body());

      UserType sessionUserLevel = ctx.sessionAttribute("privilegeLevel");
      String organizationName = ctx.sessionAttribute("orgName");

      if (sessionUserLevel == null) {
        logger.error("Token failure");
        ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
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
        logger.error("Invalid privilege type");
        ctx.json(UserMessage.INVALID_PRIVILEGE_TYPE.toJSON().toString());
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
                organizationName,
                address,
                city,
                state,
                zipcode,
                twoFactorOn,
                username,
                password,
                userType);
      } catch (ValidationException ve) {
        logger.error("Validation exception");
        ctx.json(ve.getJSON().toString());
        return;
      }

      if ((user.getUserType() == UserType.Director
              || user.getUserType() == UserType.Admin
              || user.getUserType() == UserType.Worker)
          && sessionUserLevel != UserType.Admin
          && sessionUserLevel != UserType.Director) {
        logger.error("Cannot enroll ADMIN/DIRECTOR as NON-ADMIN/NON-DIRECTOR");
        ctx.json(UserMessage.NONADMIN_ENROLL_ADMIN.toJSON().toString());
        return;
      }

      if (user.getUserType() == UserType.Client && sessionUserLevel == UserType.Client) {
        logger.error("Cannot enroll CLIENT as CLIENT");
        ctx.json(UserMessage.CLIENT_ENROLL_CLIENT.toJSON().toString());
        return;
      }

      MongoCollection<User> userCollection = db.getCollection("user", User.class);
      User existingUser = userCollection.find(eq("username", user.getUsername())).first();

      if (existingUser != null) {
        logger.error("Username already exists");
        ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().toString());
        return;
      }

      String hash = securityUtils.hashPassword(password);
      if (hash == null) {
        logger.error("Could not has password");
        ctx.json(UserMessage.HASH_FAILURE.toJSON().toString());
        return;
      }

      user.setPassword(hash);
      userCollection.insertOne(user);
      ctx.json(UserMessage.ENROLL_SUCCESS.toJSON().toString());
      logger.info("Successfully created user, " + user.getUsername());
    };
  }

  public Handler logout =
      ctx -> {
        ctx.req.getSession().invalidate();
        logger.info("Signed out");
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler getUserInfo =
      ctx -> {
        logger.info("Started getUserInfo handler");
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
          logger.info("Successfully got user info");
        } else {
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
          logger.error("Session Token Failure");
        }
      };

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

  private JSONArray getPage(JSONArray elements, int pageStartIndex, int pageEndIndex) {
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
