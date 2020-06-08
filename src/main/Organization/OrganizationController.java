package Organization;

import User.User;
import User.UserMessage;
import User.UserType;
import Validation.OrganizationValidation;
import Validation.ValidationMessage;
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
        if (!OrganizationValidation.isValid(new Organization(ctx))) {
          return;
        }
        ctx.json(OrgEnrollmentStatus.SUCCESS.toJSON());
      };

  public Handler enrollOrganization =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String firstName = req.getString("firstname").toUpperCase().strip();
        String lastName = req.getString("lastname").toUpperCase().strip();
        String birthDate = req.getString("birthDate").strip();
        String email = req.getString("email").toLowerCase().strip();
        String phone = req.getString("phonenumber").strip();
        String address = req.getString("address").toUpperCase().strip();
        String city = req.getString("city").toUpperCase().strip();
        String state = req.getString("state").toUpperCase().strip();
        String zipcode = req.getString("zipcode").strip();
        String username = req.getString("username").strip();
        String password = req.getString("password").strip();
        String userLevel = req.getString("personRole");

        Organization org = new Organization(ctx);
        if (!OrganizationValidation.isValid(org)) {
          return;
        }

        ValidationMessage vm =
            User.isValid(
                firstName,
                lastName,
                birthDate,
                email,
                phone,
                org.orgName,
                address,
                city,
                state,
                zipcode,
                username,
                password,
                userLevel);

        if (vm != ValidationMessage.VALID) {
          ctx.json(ValidationMessage.toUserMessageJSON(vm));
          return;
        }

        User user =
            new User(
                firstName,
                lastName,
                birthDate,
                email,
                phone,
                org.orgName,
                address,
                city,
                state,
                zipcode,
                username,
                password,
                UserType.userTypeFromString(userLevel));

        MongoCollection<Document> orgCollection = db.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", org.orgName)).first();

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", user.getUsername())).first();

        if (existingOrg != null) {
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON());
        } else if (existingUser != null) {
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = user.getPassword().toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE.toJSON());
            return;
          }

          user.setPassword(passwordHash);
          userCollection.insertOne(user);

          Document newOrg =
              new Document("orgName", org.orgName)
                  .append("website", org.orgWebsite)
                  .append("ein", org.orgEIN)
                  .append("address", org.orgStreetAddress)
                  .append("city", org.orgCity)
                  .append("state", org.orgState)
                  .append("zipcode", org.orgZipcode)
                  .append("email", org.orgEmail)
                  .append("phone", org.orgPhoneNumber);
          orgCollection.insertOne(newOrg);
          ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toJSON());
        }
      };
}
