package Organization;

import UserTest.UserMessage;
import Validation.OrganizationValidation;
import Validation.UserValidation;
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

  public Handler organizationSignupValidator =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String orgName = req.getString("organizationName").strip();
        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
        String orgEIN = req.getString("organizationEIN").strip();
        String orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
        String orgZipcode = req.getString("organizationAddressZipcode").strip();
        String orgEmail = req.getString("organizationEmail").strip();
        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();
        if (!OrganizationValidation.isValid(
            orgName,
            orgWebsite,
            orgEIN,
            orgStreetAddress,
            orgCity,
            orgState,
            orgZipcode,
            orgEmail,
            orgPhoneNumber,
            ctx)) {
          return;
        }

        ctx.json(OrgEnrollmentStatus.SUCCESS.toJSON());
      };
  public Handler enrollOrganization =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());

        String orgName = req.getString("organizationName").strip();
        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
        String orgEIN = req.getString("organizationEIN").strip();
        String orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
        String orgZipcode = req.getString("organizationAddressZipcode").strip();
        String orgEmail = req.getString("organizationEmail").strip();
        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();
        if (!OrganizationValidation.isValid(
            orgName,
            orgWebsite,
            orgEIN,
            orgStreetAddress,
            orgCity,
            orgState,
            orgZipcode,
            orgEmail,
            orgPhoneNumber,
            ctx)) {
          return;
        }

        String firstName = req.getString("personFirstName").toUpperCase().strip();
        String lastName = req.getString("personLastName").toUpperCase().strip();
        String birthDate = req.getString("personBirthDate").strip();
        String email = req.getString("personEmail").toLowerCase().strip();
        String phone = req.getString("personPhoneNumber").strip();
        String address = req.getString("personAddressStreet").toUpperCase().strip();
        String city = req.getString("personAddressCity").toUpperCase().strip();
        String state = req.getString("personAddressState").toUpperCase().strip();
        String zipcode = req.getString("personAddressZipcode").strip();
        String username = req.getString("personUsername").strip();
        String password = req.getString("personPassword").strip();

        if (!UserValidation.isValid(
            firstName, lastName, birthDate, email, phone, address, city, state, zipcode, username,
            password, ctx)) {
          return;
        }

        MongoCollection<Document> orgCollection = db.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        MongoCollection<Document> userCollection = db.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingOrg != null) {
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON());
        } else if (existingUser != null) {
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = password.toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE.toJSON());
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
                  .append("privilegeLevel", "Admin")
                  .append("canView", true)
                  .append("canEdit", true)
                  .append("canRegister", true);
          userCollection.insertOne(newAdmin);

          Document newOrg =
              new Document("orgName", orgName)
                  .append("website", orgWebsite)
                  .append("ein", orgEIN)
                  .append("address", orgStreetAddress)
                  .append("city", orgCity)
                  .append("state", orgState)
                  .append("zipcode", orgZipcode)
                  .append("email", orgEmail)
                  .append("phone", orgPhoneNumber);
          orgCollection.insertOne(newOrg);

          // ctx.sessionAttribute("privilegeLevel", "admin");
          // ctx.sessionAttribute("orgName", orgName);

          ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toJSON());
        }
      };
}
