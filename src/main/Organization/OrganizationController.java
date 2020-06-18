package Organization;

import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
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
        JSONObject res = new JSONObject();

        String orgName = req.getString("organizationName").strip();
        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
        String orgEIN = req.getString("organizationEIN").strip();
        String orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
        String orgZipcode = req.getString("organizationAddressZipcode").strip();
        String orgEmail = req.getString("organizationEmail").strip();
        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();

        MongoCollection<Organization> orgCollection =
            db.getCollection("organization", Organization.class);
        Organization existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        if (existingOrg != null) {
          ctx.json(res.put("status", OrgEnrollmentStatus.ORG_EXISTS.toJSON()).toString());
          return;
        }

        try {
          new Organization(
              orgName,
              orgWebsite,
              orgEIN,
              orgStreetAddress,
              orgCity,
              orgState,
              orgZipcode,
              orgEmail,
              orgPhoneNumber);
          ctx.json(
              res.put(
                      "status",
                      OrganizationValidationMessage.toOrganizationMessageJSON(
                          OrganizationValidationMessage.VALID))
                  .toString());
        } catch (ValidationException ve) {
          ctx.json(res.put("status", ve.getMessage()).toString());
        }
      };

  public Handler enrollOrganization =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();

        String firstName = req.getString("firstname").toUpperCase().strip();
        String lastName = req.getString("lastname").toUpperCase().strip();
        String birthDate = req.getString("birthDate").strip();
        String email = req.getString("email").toLowerCase().strip();
        String phone = req.getString("phonenumber").strip();
        String address = req.getString("address").toUpperCase().strip();
        String city = req.getString("city").toUpperCase().strip();
        String state = req.getString("state").toUpperCase().strip();
        String zipcode = req.getString("zipcode").strip();
        Boolean twoFactorOn = req.getBoolean("twoFactorOn");
        String username = req.getString("username").strip();
        String password = req.getString("password").strip();
        UserType userLevel = UserType.Admin;

        String orgName = req.getString("organizationName").strip();
        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
        String orgEIN = req.getString("organizationEIN").strip();
        String orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
        String orgZipcode = req.getString("organizationAddressZipcode").strip();
        String orgEmail = req.getString("organizationEmail").strip();
        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();

        Organization org;
        User user;
        try {
          org =
              new Organization(
                  orgName,
                  orgWebsite,
                  orgEIN,
                  orgStreetAddress,
                  orgCity,
                  orgState,
                  orgZipcode,
                  orgEmail,
                  orgPhoneNumber);
          user =
              new User(
                  firstName,
                  lastName,
                  birthDate,
                  email,
                  phone,
                  orgName,
                  address,
                  city,
                  state,
                  zipcode,
                  twoFactorOn,
                  username,
                  password,
                  userLevel);
        } catch (ValidationException ve) {
          ctx.json(res.put("status", ve.getMessage()).toString());
          return;
        }

        MongoCollection<Organization> orgCollection =
            db.getCollection("organization", Organization.class);
        Organization existingOrg = orgCollection.find(eq("orgName", org.getOrgName())).first();

        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User existingUser = userCollection.find(eq("username", user.getUsername())).first();

        if (existingOrg != null) {
          ctx.json(res.put("status", OrgEnrollmentStatus.ORG_EXISTS.toJSON()).toString());
        } else if (existingUser != null) {
          ctx.json(res.put("status", UserMessage.USERNAME_ALREADY_EXISTS.toJSON()).toString());
        } else {
          Argon2 argon2 = Argon2Factory.create();
          char[] passwordArr = user.getPassword().toCharArray();
          String passwordHash;
          try {
            passwordHash = argon2.hash(10, 65536, 1, passwordArr);
            argon2.wipeArray(passwordArr);
          } catch (Exception e) {
            argon2.wipeArray(passwordArr);
            ctx.json(res.put("status", OrgEnrollmentStatus.PASS_HASH_FAILURE.toJSON()).toString());
            return;
          }

          user.setPassword(passwordHash);
          userCollection.insertOne(user);

          orgCollection.insertOne(org);
          ctx.json(
              res.put("status", OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toJSON()).toString());
        }
      };
}
