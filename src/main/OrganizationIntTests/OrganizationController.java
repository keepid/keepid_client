package OrganizationIntTests;

import static com.mongodb.client.model.Filters.eq;

import UserIntTests.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;

public class OrganizationController {

  MongoDatabase db;

  public OrganizationController(MongoDatabase db) {
    this.db = db;
  }

  public Handler enrollOrganization =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        System.out.println("here");
        if (!OrganizationValidation.isValid(req, ctx)) {
          return;
        }
        System.out.println("here2");
        String orgName = req.getString("orgName");
        String orgWebsite = req.getString("orgWebsite").toLowerCase();
        String adminName = req.getString("name").toLowerCase();
        String orgContactPhoneNumber = req.getString("phone").toLowerCase();
        String email = req.getString("email").toLowerCase();
        String username = req.getString("username");
        String password = req.getString("password");
        String address = req.getString("address").toLowerCase();
        String city = req.getString("city").toLowerCase();
        String state = req.getString("state").toUpperCase();
        String zipcode = req.getString("zipcode");
        String taxCode = req.getString("taxCode");
        Integer numUsers = Integer.parseInt(req.getString("numUsers"));

        MongoCollection<Document> orgCollection = db.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        MongoCollection<Document> userCollection = db.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingOrg != null) {
          ctx.result(OrgEnrollmentStatus.ORG_EXISTS.toString());
        } else if (existingUser != null) {
          ctx.result(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = password.toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.result(OrgEnrollmentStatus.PASS_HASH_FAILURE.toString());
            return;
          }

          Document newAdmin =
              new Document("username", username)
                  .append("password", passwordHash)
                  .append("organization", orgName)
                  .append("email", email)
                  .append("name", adminName)
                  .append("privilegeLevel", "admin");
          userCollection.insertOne(newAdmin);

          Document newOrg =
              new Document("orgName", orgName)
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
          ctx.result(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString());
        }
      };
}
