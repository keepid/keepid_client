package Security;

import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.Date;

import static com.mongodb.client.model.Filters.eq;

public class AccountSecurityController {
  private MongoDatabase db;

  public AccountSecurityController(MongoDatabase db) {
    this.db = db;
  }

  private static String verificationCodeEmailPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "main"
          + File.separator
          + "Security"
          + File.separator
          + "verificationCodeEmail.html";

  private static String passwordResetLinkEmailPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "main"
          + File.separator
          + "Security"
          + File.separator
          + "passwordResetLinkEmail.html";

  public Handler forgotPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String username = req.getString("username");

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }

        String emailAddress = user.getEmail();
        if (emailAddress == null) {
          ctx.json(UserMessage.SERVER_ERROR.toJSON("Email not found for this user.").toString());
        }

        String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
        int expirationTime = 7200000; // 2 hours
        String jwt =
            SecurityUtils.createJWT(
                id, "KeepID", username, "Password Reset Confirmation", expirationTime);

        MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
        tokenCollection.replaceOne(
            eq("username", username),
            new Tokens().setUsername(username).setResetJwt(jwt),
            new ReplaceOptions().upsert(true));
        String emailJWT = getPasswordResetEmail("https://keep.id/reset-password/" + jwt);
        EmailUtil.sendEmail("Keep Id", emailAddress, "Password Reset Confirmation", emailJWT);

        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  // Changes the password of a logged in user.
  public Handler changePasswordIn =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String oldPassword = req.getString("oldPassword");
        String newPassword = req.getString("newPassword");
        String username = ctx.sessionAttribute("username");

        if (username == null) {
          ctx.json(
              UserMessage.SESSION_TOKEN_FAILURE
                  .toJSON("Unauthorized to change password.")
                  .toString());
          return;
        }

        UserMessage changeStatus = changePassword(username, newPassword, oldPassword, db);
        ctx.json(changeStatus.toJSON().toString());
      };

  public Handler changeAccountSetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String password = req.getString("password");
        String key = req.getString("key");
        String value = req.getString("value");
        String username = ctx.sessionAttribute("username");
        Argon2 argon2 = Argon2Factory.create();
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }
        char[] passwordChar = password.toCharArray();
        String hash = user.getPassword();
        if (!argon2.verify(hash, passwordChar)) {
          argon2.wipeArray(passwordChar);
          ctx.json(UserMessage.AUTH_FAILURE.toJSON().toString());
          return;
        }
        argon2.wipeArray(passwordChar);

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

        userCollection.replaceOne(eq("username", user.getUsername()), user);
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

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
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        // Return USER_NOT_FOUND if the username does not exist.
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }

        // Check for expired reset link.
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);

        if (claim.getExpiration().compareTo(now) < 0) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset link expired.").toString());
          return;
        }

        // Check if reset token exists.
        MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
        Tokens tokens = tokenCollection.find(eq("username", username)).first();
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

        // Remove the token entry if its last remaining key is the password-reset-token.
        // Remove only the password reset token if there are other fields.
        if (tokens.numTokens() == 1) {
          tokenCollection.deleteOne(eq("username", username));
        } else {
          // Remove password-reset-jwt field from token.
          tokenCollection.replaceOne(eq("username", username), tokens.setResetJwt(null));
        }

        resetPassword(claim.getAudience(), newPassword, db);
        ctx.json(UserMessage.SUCCESS.toJSON().toString());
      };

  public Handler twoFactorAuth =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String username = req.getString("username");
        String token = req.getString("token");

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        // Return USER_NOT_FOUND if the username does not exist.
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }

        // Check if 2fa token exists.
        MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
        Tokens tokens = tokenCollection.find(eq("username", username)).first();
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
        if (tokens.numTokens() == 1) {
          tokenCollection.deleteOne(eq("username", username));
        } else {
          // Remove password-reset-jwt field from token.
          tokenCollection.replaceOne(
              eq("username", username), tokens.setTwoFactorCode(null).setTwoFactorExp(null));
        }

        // Set Session token.
        ctx.sessionAttribute("privilegeLevel", user.getUserType());
        ctx.sessionAttribute("orgName", user.getOrganization());
        ctx.sessionAttribute("username", username);

        ctx.json(UserMessage.AUTH_SUCCESS.toJSON().toString());
      };

  public static String getVerificationCodeEmail(String verificationCode) {
    File verificationCodeEmail = new File(verificationCodeEmailPath);
    try {
      Document htmlDoc = Jsoup.parse(verificationCodeEmail, "UTF-8");
      Element targetElement = htmlDoc.getElementById("targetVerificationCode");
      targetElement.text(verificationCode);
      return htmlDoc.toString();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static String getPasswordResetEmail(String jwt) {
    File passwordResetEmail = new File(passwordResetLinkEmailPath);
    try {
      Document htmlDoc = Jsoup.parse(passwordResetEmail, "UTF-8");
      Element targetElement = htmlDoc.getElementById("hrefTarget");
      targetElement.attr("href", jwt);
      return htmlDoc.toString();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static UserMessage changePassword(
      String username, String newPassword, String oldPassword, MongoDatabase db) {

    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", username)).first();

    if (user == null) { // The user does not exist in the database.
      return UserMessage.USER_NOT_FOUND;
    }

    char[] oldPasswordArr = oldPassword.toCharArray();
    String hash = user.getPassword();

    Argon2 argon2 = Argon2Factory.create();
    if (!argon2.verify(hash, oldPasswordArr)) { // The provided old password is not correct.
      argon2.wipeArray(oldPasswordArr);
      return UserMessage.AUTH_FAILURE;
    }
    resetPassword(username, newPassword, db);
    return UserMessage.AUTH_SUCCESS;
  }

  private static void resetPassword(String username, String newPassword, MongoDatabase db) {
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", username)).first();

    Argon2 argon2 = Argon2Factory.create();
    char[] newPasswordArr = newPassword.toCharArray();
    String passwordHash = argon2.hash(10, 65536, 1, newPasswordArr);

    userCollection.replaceOne(eq("username", username), user.setPassword(passwordHash));
    argon2.wipeArray(newPasswordArr);
  }
}
