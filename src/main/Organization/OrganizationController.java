package Organization;

import User.UserMessage;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import Config.MongoConfig;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;

import static com.mongodb.client.model.Filters.*;

public class OrganizationController {
    public static Handler enrollOrganization = ctx -> {

        JSONObject obj = new JSONObject(ctx.body());

        String orgName = obj.getString("orgName");
        String orgWebsite = obj.getString("orgWebsite").toLowerCase();
        String adminName = obj.getString("name").toLowerCase();
        String orgContactPhoneNumber = obj.getString("phone").toLowerCase();
        String email = obj.getString("email").toLowerCase();
        String username = obj.getString("username");
        String password = obj.getString("password");
        String address = obj.getString("address").toLowerCase();
        String city = obj.getString("city").toLowerCase();
        String state = obj.getString("state").toUpperCase();
        String zipcode = obj.getString("zipcode");
        String taxCode = obj.getString("taxCode");
        Integer numUsers = Integer.parseInt(obj.getString("numUsers"));

        MongoDatabase database = MongoConfig.getMongoClient()
                .getDatabase(MongoConfig.getDatabaseName());

        MongoCollection<Document> orgCollection = database.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        MongoCollection<Document> userCollection = database.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingOrg != null) {
            ctx.json(OrgEnrollmentStatus.ORG_EXISTS);
        }
        else if (existingUser != null) {
            ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
        }
        else {
            Argon2 argon2 = Argon2Factory.create();
            char[] passwordArr = password.toCharArray();
            String passwordHash;
            try {
                passwordHash = argon2.hash(10, 65536, 1, passwordArr);
                argon2.wipeArray(passwordArr);
            }
            catch (Exception e) {
                argon2.wipeArray(passwordArr);
                ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE);
                return;
            }

            Document newAdmin = new Document("username", username)
                    .append("password", passwordHash)
                    .append("organization", orgName)
                    .append("email", email)
                    .append("name", adminName)
                    .append("privilegeLevel", "admin");
            userCollection.insertOne(newAdmin);

            Document newOrg = new Document("orgName", orgName)
                    .append("website", orgWebsite)
                    .append("contact number", orgContactPhoneNumber)
                    .append("street address", address)
                    .append("city", city)
                    .append("state", state)
                    .append("zipcode", zipcode)
                    .append("taxCode", taxCode)
                    .append("expectedNumUsers", numUsers);
            orgCollection.insertOne(newOrg);

            /*
            Algorithm algo = Algorithm.HMAC256("secret");
            String token = JWT.create()
                    .withClaim("privilegeLevel", "admin")
                    .withClaim("orgName", orgName)
                    .sign(algo);
            ctx.cookieStore("token", token);
             */
            ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT);
        }
    };
}
