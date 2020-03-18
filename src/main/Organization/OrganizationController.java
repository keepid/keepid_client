package Organization;

import UserTest.UserMessage;
import Validation.OrganizationValidation;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;

import static com.mongodb.client.model.Filters.eq;

public class OrganizationController {

  MongoDatabase db;

  public OrganizationController(MongoDatabase db) {
    this.db = db;
  }

  public Handler enrollOrganization =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        if (!OrganizationValidation.isValid(req, ctx)) {
          return;
        }
        String orgName = req.getString("organizationName");
        String orgWebsite = req.getString("organizationWebsite").toLowerCase();
        String orgTaxCode = req.getString("organizationEIN");
        String orgAddress = req.getString("organizationAddressStreet").toUpperCase();
        String orgCity = req.getString("organizationAddressCity").toUpperCase();
        String orgState = req.getString("organizationAddressState").toUpperCase();
        String orgZipcode = req.getString("organizationAddressZipcode");
        String orgEmail = req.getString("organizationEmail");
        String orgPhoneNumber = req.getString("organizationPhoneNumber");

        String firstName = req.getString("personFirstName").toUpperCase();
        String lastName = req.getString("personLastName").toUpperCase();
        String birthDate = req.getString("personBirthDate");
        String email = req.getString("personEmail").toLowerCase();
        String phone = req.getString("personPhoneNumber");
        String address = req.getString("personAddressStreet").toUpperCase();
        String city = req.getString("personAddressCity").toUpperCase();
        String state = req.getString("personAddressState").toUpperCase();
        String zipcode = req.getString("personAddressZipcode");
        String username = req.getString("personUsername");
        String password = req.getString("personPassword");

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
                  .append("phone", phone)
                  .append("firstName", firstName)
                  .append("lastName", lastName)
                  .append("birthDate", birthDate)
                  .append("address", address)
                  .append("city", city)
                  .append("state", state)
                  .append("zipcode", zipcode)
                  .append("privilegeLevel", "admin")
                  .append("canView", true)
                  .append("canEdit", true)
                  .append("canRegister", true);
          userCollection.insertOne(newAdmin);

          Document newOrg =
              new Document("orgName", orgName)
                  .append("website", orgWebsite)
                  .append("taxCode", orgTaxCode)
                  .append("address", orgAddress)
                  .append("city", orgCity)
                  .append("state", orgState)
                  .append("zipcode", orgZipcode)
                  .append("email", orgEmail)
                  .append("phone", orgPhoneNumber);
          orgCollection.insertOne(newOrg);

          // ctx.sessionAttribute("privilegeLevel", "admin");
          // ctx.sessionAttribute("orgName", orgName);

          ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString());
        }
      };
}
