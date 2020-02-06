package UserIntTests;

import Config.MongoConfig;
import Logger.LogFactory;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.core.security.Role;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Set;

import static com.mongodb.client.model.Filters.eq;

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
            ctx.json(UserMessage.USER_NOT_FOUND.getErrorName());
            argon2.wipeArray(passwordArr);
            return;
          }

          String hash = user.get("password", String.class);
          if (argon2.verify(hash, passwordArr)) {
            // Hash matches password

            ctx.sessionAttribute("privilegeLevel", user.get("privilegeLevel"));
            ctx.sessionAttribute("orgName", user.get("organization"));
            logger.error("PUT SESSION LEVEL: " + ctx.sessionAttribute("privilegeLevel"));
            logger.error("PUT SESSION NAME: " + ctx.sessionAttribute("orgName"));


            ctx.json(UserMessage.AUTH_SUCCESS.getErrorName());
          } else {
            // Hash doesn't match password
            ctx.json(UserMessage.AUTH_FAILURE.getErrorName());
          }
        } catch (Exception e) {
          ctx.json(UserMessage.HASH_FAILURE.getErrorName());
        } finally {
          // Wipe confidential data from cache
          argon2.wipeArray(passwordArr);
        }
      };

  public Handler createNewUser =
      ctx -> {
        logger.error("SESSION: " + ctx.req.getSession().toString());
        logger.error("SESSION: " + ctx.sessionAttribute("orgName"));
        logger.error("SESSION: " + ctx.sessionAttribute("privilegeLevel"));
        logger.error("SESSION: " + ctx.sessionAttributeMap());

        System.out.println("SESSION: " + ctx.req.getSession().toString());
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
        String userLevel = req.getString("userLevel");

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
          ctx.json(UserMessage.NONADMIN_ENROLL_ADMIN.getErrorName());
          return;
        }

        if (userLevel.equals("worker") && !sessionUserLevel.equals("admin")) {
          ctx.json(UserMessage.NONADMIN_ENROLL_WORKER.getErrorName());
          return;
        }

        if (userLevel.equals("client") && sessionUserLevel.equals("client")) {
          ctx.json(UserMessage.CLIENT_ENROLL_CLIENT.getErrorName());
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
            ctx.result(UserMessage.HASH_FAILURE.getErrorName());
            return;
          }

          Document newUser =
              new Document("username", username)
                  .append("password", passwordHash)
                  .append("organization", sessionOrg)
                  .append("email", email)
                  .append("phone", phonenumber)
                  .append("firstName", firstName)
                  .append("lastName", lastName)
                  .append("address", address)
                  .append("city", city)
                  .append("state", state)
                  .append("zipcode", zipcode)
                  .append("privilegeLevel", userLevel);
          userCollection.insertOne(newUser);

          ctx.result(UserMessage.ENROLL_SUCCESS.getErrorName());
        }
      };

  public static void accessManager(Handler handler, Context ctx, Set<Role> roles) throws Exception {
    String priv = ctx.sessionAttribute("privilegeLevel");
    if ("admin".equals(priv) || "worker".equals(priv) || "client".equals("priv")) {
      handler.handle(ctx);
    } else {
      ctx.status(401);
    }
  }
}
