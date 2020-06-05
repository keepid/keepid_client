package User;

import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.UpdateOptions;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import io.javalin.http.sse.SseClient;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.json.JSONObject;

import java.security.SecureRandom;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

import static com.mongodb.client.model.Filters.eq;

public class AccountSecurityController {
  // TODO(kofmangreogory): Move this to a centralized location, like a database, before Keep has
  // many server instances.
  private Map<String, SseClient> twoFactorClients;
  private MongoDatabase db;

  public AccountSecurityController(MongoDatabase db) {
    this.db = db;
    this.twoFactorClients = new ConcurrentHashMap<String, SseClient>();
  }

  public Handler forgotPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");

        MongoCollection<Document> userCollection = db.getCollection("user");
        Document user = userCollection.find(eq("username", username)).first();

        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON());
          return;
        }

        String emailAddress = user.get("email", String.class);
        if (emailAddress == null) {
          ctx.json(UserMessage.SERVER_ERROR.toJSON("Email not found for this user."));
        }

        String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
        int expirationTime = 7200000; // 2 hours
        String jwt =
            JWTUtils.createJWT(
                id, "KeepID", username, "Password Reset Confirmation", expirationTime);

        MongoCollection<Document> tokenCollection = db.getCollection("tokens");
        tokenCollection.updateOne(
            eq("username", username),
            new Document(
                "$set", new Document("username", username).append("password-reset-jwt", jwt)),
            new UpdateOptions().upsert(true));

        EmailUtil.sendEmail(
            "Keep Id",
            emailAddress,
            "Password Reset Confirmation",
            "https://keep.id/reset-password/" + jwt);

        ctx.json(UserMessage.SUCCESS.toJSON());
      };

  // Changes the password of a logged in user.
  public Handler changePasswordIn =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String oldPassword = req.getString("oldPassword");
        String newPassword = req.getString("newPassword");
        String username = ctx.sessionAttribute("username");

        if (username == null) {
          ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON("Unauthorized to change password."));
          return;
        }

        UserMessage changeStatus = changePassword(username, newPassword, oldPassword, db);
        ctx.json(changeStatus.toJSON());
      };

  public Handler changeAccountSetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String password = req.getString("password");
        String key = req.getString("key");
        String value = req.getString("value");
        String username = ctx.sessionAttribute("username");
        Argon2 argon2 = Argon2Factory.create();
        MongoCollection<Document> userCollection = db.getCollection("user");
        Document user = userCollection.find(eq("username", username)).first();
        if (user == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON());
          return;
        }
        char[] passwordChar = password.toCharArray();
        String hash = user.get("password", String.class);
        if (!argon2.verify(hash, passwordChar)) {
          argon2.wipeArray(passwordChar);
          ctx.json(UserMessage.AUTH_FAILURE.toJSON());
          return;
        }
        argon2.wipeArray(passwordChar);
        if (!user.containsKey(key)) {
          ctx.json(UserMessage.INVALID_PARAMETER.toJSON());
          return;
        }
        // case statements for input validation
        switch (key) {
          case "firstName":
            if (!ValidationUtils.isValidFirstName(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid First Name"));
              return;
            }
            break;
          case "lastName":
            if (!ValidationUtils.isValidLastName(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Last Name"));
              return;
            }
            break;
          case "birthDate":
            if (!ValidationUtils.isValidBirthDate(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date Name"));
              return;
            }
            break;
          case "phone":
            if (!ValidationUtils.isValidPhoneNumber(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Phone Number"));
              return;
            }
            break;
          case "email":
            if (!ValidationUtils.isValidEmail(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Email"));
              return;
            }
            break;
          case "address":
            if (!ValidationUtils.isValidAddress(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Address"));
              return;
            }
            break;
          case "city":
            if (!ValidationUtils.isValidCity(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid City Name"));
              return;
            }
            break;
          case "state":
            if (!ValidationUtils.isValidUSState(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid US State"));
              return;
            }
            break;
          case "zipcode":
            if (!ValidationUtils.isValidZipCode(key)) {
              ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date Name"));
              return;
            }
            break;
        }
        Document query = new Document().append("_id", user.get("_id"));
        Document update = new Document();
        update.append("$set", new Document().append(key, value));

        userCollection.updateOne(query, update);

        ctx.json(UserMessage.SUCCESS.toJSON());
      };

  public Handler resetPassword =
      ctx -> {

        // Decode the JWT. If invalid, return AUTH_FAILURE.
        String jwt = ctx.pathParam("jwt");
        Claims claim = null;
        try {
          claim = JWTUtils.decodeJWT(jwt);
        } catch (Exception e) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid reset link."));
          return;
        }

        String username = claim.getAudience();
        MongoCollection<Document> userCollection = db.getCollection("user");
        Document user = userCollection.find(eq("username", username)).first();

        // Return USER_NOT_FOUND if the username does not exist.
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON());
          return;
        }

        // Check for expired reset link.
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);

        if (claim.getExpiration().compareTo(now) < 0) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset link expired."));
          return;
        }

        // Check if reset token exists.
        MongoCollection<Document> tokenCollection = db.getCollection("tokens");
        Document tokens = tokenCollection.find(eq("username", username)).first();
        if (tokens == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user."));
          return;
        }

        String storedJWT = tokens.getString("password-reset-jwt");
        if (storedJWT == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user."));
          return;
        }

        if (!storedJWT.equals(jwt)) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid reset token."));
          return;
        }

        // Remove the token entry if its last remaining key is the password-reset-token.
        // Remove only the password reset token if there are other fields.
        if (tokens.size() == 3) {
          tokenCollection.deleteOne(eq("username", username));
        } else {
          // Remove password-reset-jwt field from document.
          tokenCollection.updateOne(
              eq("username", username),
              new Document().append("$unset", new Document("password-reset-jwt", "")));
        }

        JSONObject req = new JSONObject(ctx.body());
        String newPassword = req.getString("newPassword");
        resetPassword(claim.getAudience(), newPassword, db);

        ctx.json(UserMessage.SUCCESS.toJSON());
      };

  public Handler twoFactorAuth =
      ctx -> {
        String jwt = ctx.pathParam("jwt");
        Claims claim = null;
        try {
          claim = JWTUtils.decodeJWT(jwt);
        } catch (Exception e) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid 2FA token."));
          return;
        }

        String username = claim.getAudience();
        MongoCollection<Document> userCollection = db.getCollection("user");
        Document user = userCollection.find(eq("username", username)).first();

        SseClient client = this.twoFactorClients.get(username);

        // Return USER_NOT_FOUND if the username does not exist.
        if (user == null) {
          this.twoFactorClients.remove(username);
          if (client != null) client.sendEvent(UserMessage.USER_NOT_FOUND.toJSON());
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON());
          return;
        }

        // Check for expired reset link.
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);

        if (claim.getExpiration().compareTo(now) < 0) {
          this.twoFactorClients.remove(username);
          if (client != null)
            client.sendEvent(UserMessage.AUTH_FAILURE.toJSON("2FA link expired."));
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2FA link expired."));
          return;
        }

        // Check if reset token exists.
        MongoCollection<Document> tokenCollection = db.getCollection("tokens");
        Document tokens = tokenCollection.find(eq("username", username)).first();
        if (tokens == null) {
          this.twoFactorClients.remove(username);
          if (client != null)
            client.sendEvent(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user."));
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user."));
          return;
        }

        String storedJWT = tokens.getString("2fa-jwt");
        if (storedJWT == null || client == null) {
          this.twoFactorClients.remove(username);
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Reset token not found for user."));
          return;
        }

        if (!storedJWT.equals(jwt)) {
          this.twoFactorClients.remove(username);
          client.sendEvent(UserMessage.AUTH_FAILURE.toJSON("Invalid reset token."));
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid reset token."));
          return;
        }

        // Remove the token entry if its last remaining key is the password-reset-token.
        // Remove only the password reset token if there are other fields.
        if (tokens.size() == 3) {
          tokenCollection.deleteOne(eq("username", username));
        } else {
          // Remove password-reset-jwt field from document.
          tokenCollection.updateOne(
              eq("username", username),
              new Document().append("$unset", new Document("2fa-jwt", "")));
        }

        client.sendEvent(UserMessage.AUTH_SUCCESS.toJSON());
        ctx.json(UserMessage.AUTH_SUCCESS.toJSON());
      };

  public Consumer<SseClient> twoFactorAuthSse() {
    return client -> {
      // On opening connection, username is retrieved through the Server-Event query param.
      // The client is stored in the clients map.
      String username = client.ctx.queryParam("username");
      String plainPassword = client.ctx.queryParam("password");
      Document user = db.getCollection("user").find(eq("username", username)).first();

      // Ensure a user exists with the provided username.
      if (user == null) {
        client.sendEvent(UserMessage.USER_NOT_FOUND.toJSON());
        return;
      }

      // Ensure the password is correct.
      char[] plainPasswordArr = plainPassword.toCharArray();
      String hash = user.get("password", String.class);
      Argon2 argon2 = Argon2Factory.create();
      if (!argon2.verify(hash, plainPasswordArr)) { // The provided old password is not correct.
        argon2.wipeArray(plainPasswordArr);
        client.sendEvent(UserMessage.AUTH_FAILURE.toJSON("Password incorrect."));
        return;
      }

      this.twoFactorClients.put(username, client);

      client.onClose(() -> this.twoFactorClients.remove(username));
    };
  }

  public static UserMessage changePassword(
      String username, String newPassword, String oldPassword, MongoDatabase db) {

    MongoCollection<Document> userCollection = db.getCollection("user");
    Document user = userCollection.find(eq("username", username)).first();

    if (user == null) { // The user does not exist in the database.
      return UserMessage.USER_NOT_FOUND;
    }

    char[] oldPasswordArr = oldPassword.toCharArray();
    String hash = user.get("password", String.class);

    Argon2 argon2 = Argon2Factory.create();
    if (!argon2.verify(hash, oldPasswordArr)) { // The provided old password is not correct.
      argon2.wipeArray(oldPasswordArr);
      return UserMessage.AUTH_FAILURE;
    }
    resetPassword(username, newPassword, db);
    return UserMessage.AUTH_SUCCESS;
  }

  private static void resetPassword(String username, String newPassword, MongoDatabase db) {
    MongoCollection<Document> userCollection = db.getCollection("user");
    Document user = userCollection.find(eq("username", username)).first();

    Argon2 argon2 = Argon2Factory.create();
    char[] newPasswordArr = newPassword.toCharArray();
    String passwordHash = argon2.hash(10, 65536, 1, newPasswordArr);

    Document query = new Document().append("_id", user.get("_id"));
    Document setData = new Document().append("password", passwordHash);
    Document update = new Document().append("$set", setData);

    userCollection.updateOne(query, update);
    argon2.wipeArray(newPasswordArr);
  }
}
