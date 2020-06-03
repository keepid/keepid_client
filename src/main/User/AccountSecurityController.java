package User;

import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.json.JSONObject;

import java.security.SecureRandom;
import java.util.Date;

import static com.mongodb.client.model.Filters.eq;

public class AccountSecurityController {
  MongoDatabase db;

  public AccountSecurityController(MongoDatabase db) {
    this.db = db;
  }

  public Handler forgotPassword =
      ctx -> {
        long expirationTime = 7200000; // 2 hours
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        MongoCollection<Document> userCollection = db.getCollection("user");
        MongoCollection<Document> linkCollection = db.getCollection("link");
        Document user = userCollection.find(eq("username", username)).first();
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON());
        } else {
          String email = user.get("email", String.class);
          if (email == null) {
            ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Email not found on this user"));
          } else {
            String id;
            do {
              id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
            } while (linkCollection.find(eq("id", id)).first() != null);
            String link =
                CreateResetLink.createJWT(
                    id, "KeepID", username, "Password Reset Confirmation", expirationTime);
            EmailUtil.sendEmail(
                "Keep Id",
                email,
                "Password Reset Confirmation",
                "https://keep.id/reset-password/" + link);
            ctx.json(UserMessage.SUCCESS.toJSON());
          }
        }
      };

  public Handler changePasswordIn =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String oldPassword = req.getString("oldPassword");
        String newPassword = req.getString("newPassword");
        String username = ctx.sessionAttribute("username");
        JSONObject res = new JSONObject();

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
        JSONObject res = new JSONObject();
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
        JSONObject req = new JSONObject(ctx.body());
        String jwt = ctx.pathParam("jwt");
        Claims claim = CreateResetLink.decodeJWT(jwt);

        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);

        MongoCollection<Document> userCollection = db.getCollection("user");
        MongoCollection<Document> resetIDs = db.getCollection("emailIDs");

        Document user = userCollection.find(eq("username", claim.getAudience())).first();

        String id = claim.getId();
        Document resetID = resetIDs.find(Filters.eq("id", id)).first();

        JSONObject res = new JSONObject();
        if (!(claim.getExpiration().compareTo(now) < 0 || user == null || resetID != null)) {
          Document newID = new Document("id", id).append("expiration", claim.getExpiration());
          resetIDs.insertOne(newID);
          String newPassword = req.getString("newPassword");
          resetPassword(claim.getAudience(), newPassword, db);

          ctx.json(UserMessage.SUCCESS.toJSON());
        }
      };

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
