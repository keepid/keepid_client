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

        //ctx.req.getSession().invalidate();

        JSONObject req = new JSONObject(ctx.body());
        if (!OrganizationValidation.isValid(req, ctx)) {
          return;
        }
        String orgName = req.getString("orgName");
        String orgWebsite = req.getString("orgWebsite").toLowerCase();
        String firstName = req.getString("firstName").toLowerCase();
        String lastName = req.getString("lastName").toLowerCase();
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
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toString());
        } else if (existingUser != null) {
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = password.toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE.toString());
            return;
          }

          Document newAdmin =
              new Document("username", username)
                  .append("password", passwordHash)
                  .append("organization", orgName)
                  .append("email", email)
                  .append("phone", orgContactPhoneNumber)
                  .append("firstName", firstName)
                  .append("lastName", lastName)
                  .append("address", address)
                  .append("city", city)
                  .append("state", state)
                  .append("zipcode", zipcode)
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

          ctx.sessionAttribute("privilegeLevel", "admin");
          ctx.sessionAttribute("orgName", orgName);

          ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString());
        }
      };
}
