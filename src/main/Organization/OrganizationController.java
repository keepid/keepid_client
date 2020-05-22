package Organization;

import User.User;
import User.UserMessage;
import Validation.OrganizationValidation;
import Validation.UserValidation;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.Document;

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
        Organization org = new Organization(ctx);
        if (!OrganizationValidation.isValid(org)) {
          return;
        }

        User user = new User(ctx);
        if (!UserValidation.isValid(user)) {
          return;
        }

        MongoCollection<Document> orgCollection = db.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", org.orgName)).first();

        MongoCollection<Document> userCollection = db.getCollection("user");
        Document existingUser = userCollection.find(eq("username", user.username)).first();

        if (existingOrg != null) {
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON());
        } else if (existingUser != null) {
          ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = user.password.toCharArray();
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
              new Document("username", user.username)
                  .append("password", passwordHash)
                  .append("organization", org.orgName)
                  .append("email", user.email)
                  .append("phone", user.phone)
                  .append("firstName", user.firstName)
                  .append("lastName", user.lastName)
                  .append("birthDate", user.birthDate)
                  .append("address", user.address)
                  .append("city", user.city)
                  .append("state", user.state)
                  .append("zipcode", user.zipcode)
                  .append("privilegeLevel", "Admin")
                  .append("canView", true)
                  .append("canEdit", true)
                  .append("canRegister", true);
          userCollection.insertOne(newAdmin);

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
