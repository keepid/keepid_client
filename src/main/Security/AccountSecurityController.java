package Security;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.excludeId;
import static com.mongodb.client.model.Projections.fields;
import static com.mongodb.client.model.Projections.include;

import Activity.ActivityController;
import Activity.ChangeUserAttributesActivity;
import Activity.PasswordRecoveryActivity;
import Database.TokenDao;
import Database.UserDao;
import Logger.LogFactory;
import Security.Tokens.TokenType;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import java.util.Date;
import org.bson.Document;
import org.json.JSONObject;
import org.slf4j.Logger;

public class AccountSecurityController {
  private MongoDatabase db;
  private Logger logger;

  public AccountSecurityController(MongoDatabase db) {
    this.db = db;
    logger = (new LogFactory()).createLogger("AccountSecurityController");
  }

  public Handler forgotPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        if (!ValidationUtils.isValidUsername(username)) {
          ctx.result(UserMessage.INVALID_PARAMETER.toResponseString());
        }
        ForgotPasswordService forgotPasswordService =
            new ForgotPasswordService(db, logger, username);
        ctx.result(forgotPasswordService.executeAndGetResponse().toResponseString());
      };

  // Changes the password of a logged in user.
  public Handler changePassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = ctx.sessionAttribute("username");
        String oldPassword = req.getString("oldPassword");
        String newPassword = req.getString("newPassword");
        if (!ValidationUtils.isValidUsername(username)
            || !ValidationUtils.isValidPassword(newPassword)) {
          ctx.result(UserMessage.INVALID_PARAMETER.toResponseString());
          return;
        }
        ChangePasswordService changePasswordService =
            new ChangePasswordService(db, logger, username, oldPassword, newPassword);
        ctx.result(changePasswordService.executeAndGetResponse().toResponseString());
      };

  public Handler changeAccountSetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String password = req.getString("password");
        String key = req.getString("key");
        String value = req.getString("value");
        String username = ctx.sessionAttribute("username");
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }

        String hash = user.getPassword();
        SecurityUtils.PassHashEnum verifyStatus = SecurityUtils.verifyPassword(password, hash);
        if (verifyStatus == SecurityUtils.PassHashEnum.ERROR) {
          ctx.json(UserMessage.SERVER_ERROR.toJSON().toString());
          return;
        }
        if (verifyStatus == SecurityUtils.PassHashEnum.FAILURE) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON().toString());
          return;
        }
        MongoCollection col = db.getCollection("user");
        Document d =
            (Document)
                col.find(eq("username", username))
                    .projection(fields(include(key), excludeId()))
                    .first();
        String old = d.get(key).toString();
        ActivityController activityController = new ActivityController(db);
        ChangeUserAttributesActivity act = new ChangeUserAttributesActivity(user, key, old, value);
        activityController.addActivity(act);
        switch (key) {
          case "firstName":
            if (!ValidationUtils.isValidFirstName(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid First Name").toString());
              return;
            }
            user.setFirstName(value);
            break;
          case "lastName":
            if (!ValidationUtils.isValidLastName(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Last Name").toString());
              return;
            }
            user.setLastName(value);
            break;
          case "birthDate":
            if (!ValidationUtils.isValidBirthDate(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date Name").toString());
              return;
            }
            user.setBirthDate(value);
            break;
          case "phone":
            if (!ValidationUtils.isValidPhoneNumber(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Phone Number").toString());
              return;
            }
            user.setPhone(value);
            break;
          case "email":
            if (!ValidationUtils.isValidEmail(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Email").toString());
              return;
            }
            user.setEmail(value);
            break;
          case "address":
            if (!ValidationUtils.isValidAddress(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Address").toString());
              return;
            }
            user.setAddress(value);
            break;
          case "city":
            if (!ValidationUtils.isValidCity(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid City Name").toString());
              return;
            }
            user.setCity(value);
            break;
          case "state":
            if (!ValidationUtils.isValidUSState(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid US State").toString());
              return;
            }
            user.setState(value);
            break;
          case "zipcode":
            if (!ValidationUtils.isValidZipCode(value)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Zip Code").toString());
              return;
            }
            user.setZipcode(value);
            break;
          default:
            ctx.json(UserMessage.INVALID_PARAMETER.toJSON().toString());
            return;
        }

        userCollection.replaceOne(eq("username", user.getUsername()), user);
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler change2FASetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        Boolean twoFactorOn = req.getBoolean("twoFactorOn");
        String username = ctx.sessionAttribute("username");
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        // No current way to validate this boolean

        user.setTwoFactorOn(twoFactorOn);
        String old = BoolToString(!twoFactorOn);
        String n = BoolToString(twoFactorOn);
        ChangeUserAttributesActivity act =
            new ChangeUserAttributesActivity(user, "twoFactorOn", old, n);
        userCollection.replaceOne(eq("username", user.getUsername()), user);
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  private String BoolToString(Boolean bool) {
    if (bool) {
      return "True";
    } else {
      return "False";
    }
  }

  public Handler resetPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        // Decode the JWT. If invalid, return AUTH_FAILURE.
        String jwt = req.getString("jwt");
        String newPassword = req.getString("newPassword");
        if (!ValidationUtils.isValidPassword(newPassword)) {
          ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Password").toString());
          return;
        }
        Claims claim;
        try {
          claim = SecurityUtils.decodeJWT(jwt);
        } catch (Exception e) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid reset link.").toString());
          return;
        }

        String username = claim.getAudience();
        User user = UserDao.findOneUserOrNull(db, username);
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }

        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        if (claim.getExpiration().compareTo(now) < 0) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset link expired.").toString());
          return;
        }

        // Check if reset token exists.
        Tokens tokens = TokenDao.getTokensOrNull(db, username);
        if (tokens == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user.").toString());
          return;
        }
        String storedJWT = tokens.getResetJwt();
        if (storedJWT == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user.").toString());
          return;
        }
        if (!storedJWT.equals(jwt)) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid reset token.").toString());
          return;
        }
        TokenDao.removeTokenIfLast(db, username, tokens, TokenType.PASSWORD_RESET);
        UserDao.resetPassword(
            db, user, newPassword, PasswordRecoveryActivity.class.getSimpleName());
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler twoFactorAuth =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        String token = req.getString("token");
        User user = UserDao.findOneUserOrNull(db, username);
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }
        Tokens tokens = TokenDao.getTokensOrNull(db, username);
        if (tokens == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2fa token not found for user.").toString());
          return;
        }
        String stored2faToken = tokens.getTwoFactorCode();
        Date stored2faExpiration = tokens.getTwoFactorExp();
        if (stored2faToken == null || stored2faExpiration == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2fa token not found for user.").toString());
          return;
        }
        // Check for expired reset link.
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        if (stored2faExpiration.compareTo(now) < 0) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2FA link expired.").toString());
          return;
        }

        if (!stored2faToken.equals(token)) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid 2fa token.").toString());
          return;
        }
        // Remove the token entry if its last remaining key is the 2fa token.
        // Remove only the password reset token if there are other fields.
        TokenDao.removeTokenIfLast(db, username, tokens, TokenType.TWO_FACTOR);
        // Set Session token.
        ctx.sessionAttribute("privilegeLevel", user.getUserType());
        ctx.sessionAttribute("orgName", user.getOrganization());
        ctx.sessionAttribute("username", username);
        ctx.json(UserMessage.AUTH_SUCCESS.toJSON().toString());
      };
}
