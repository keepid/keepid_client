package User;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import static com.mongodb.client.model.Filters.*;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import Config.MongoConfig;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;

public class UserController {
    public static Handler loginUser = ctx -> {

        JSONObject obj = new JSONObject(ctx.body());
        String username = obj.getString("username");
        String password = obj.getString("password");

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

                //ctx.sessionAttribute("privilegeLevel", user.get("privilegeLevel"));
                //ctx.sessionAttribute("orgName", user.get("organization"));
               /*
                Algorithm algo = Algorithm.HMAC256("secret");
                String token = JWT.create()
                        .withClaim("privilegeLevel", (String)user.get("privilegeLevel"))
                        .withClaim("orgName", (String)user.get("organization"))
                        .sign(algo);
                ctx.cookieStore("token", token);
                */
                ctx.json(UserMessage.AUTH_SUCCESS.getErrorName());
            } else {
                // Hash doesn't match password
                ctx.json(UserMessage.AUTH_FAILURE.getErrorName());
            }
        } catch(Exception e) {
            ctx.json(UserMessage.HASH_FAILURE.getErrorName());
        } finally {
            // Wipe confidential data from cache
            argon2.wipeArray(passwordArr);
        }
    };

    /*
    public static Handler createUser = ctx -> {
        // Get all formParams
        String username = ctx.formParam("username");
        String password = ctx.formParam("password");
        String organization = ctx.formParam("organization");
        String email = ctx.formParam("email");
        String name = ctx.formParam("name");
        String userLevel = ctx.formParam("userLevel");

        // Session tokens
        //String sessionUserLevel = ctx.sessionAttribute("privilegeLevel");
        //String sessionOrg = ctx.sessionAttribute("orgName");

        String token = ctx.cookieStore("token");
        DecodedJWT dJWT = JWT.decode(token);

        String sessionUserLevel = dJWT.getHeaderClaim("privilegeLevel").asString();
        String sessionOrg = dJWT.getHeaderClaim("orgName").asString();



        if (sessionUserLevel == null || sessionOrg == null) {
            ctx.result(UserMessage.SESSION_TOKEN_FAILURE.getErrorName());
            return;
        }

        if (!sessionOrg.equals(organization)) {
            ctx.result(UserMessage.DIFFERENT_ORGANIZATION.getErrorName());
            return;
        }

        if (userLevel.equals("admin") && !sessionUserLevel.equals("admin")) {
            ctx.result(UserMessage.NONADMIN_ENROLL_ADMIN.getErrorName());
            return;
        }

        if (userLevel.equals("worker") && !sessionUserLevel.equals("admin")) {
            ctx.result(UserMessage.NONADMIN_ENROLL_WORKER.getErrorName());
            return;
        }

        if (userLevel.equals("client") && sessionUserLevel.equals("client")) {
            ctx.result(UserMessage.CLIENT_ENROLL_CLIENT.getErrorName());
            return;
        }

        MongoDatabase database = MongoConfig.getMongoClient()
                .getDatabase(MongoConfig.getDatabaseName());

        MongoCollection<Document> userCollection = database.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingUser != null) {
            ctx.result(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
            return;
        }
        else {
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

            Document newAdmin = new Document("username", username)
                    .append("password", passwordHash)
                    .append("organization", organization)
                    .append("email", email)
                    .append("name", name)
                    .append("privilegeLevel", userLevel);
            userCollection.insertOne(newAdmin);

            ctx.result(UserMessage.ENROLL_SUCCESS.getErrorName());
        }
    };
    */
}
