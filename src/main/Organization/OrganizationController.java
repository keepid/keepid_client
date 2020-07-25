package Organization;

import Security.EmailExceptions;
import Security.EmailMessages;
import Security.EmailUtil;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationException;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import java.security.SecureRandom;

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

        MongoCollection<Organization> orgCollection =
            db.getCollection("organization", Organization.class);
        Organization existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        if (existingOrg != null) {
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON().toString());
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
              OrganizationValidationMessage.toOrganizationMessageJSON(
                      OrganizationValidationMessage.VALID)
                  .toString());
        } catch (ValidationException ve) {
          ctx.json(ve.getJSON().toString());
        }
      };

  public Handler enrollOrganization(SecurityUtils securityUtils) {
    return ctx -> {
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
        ctx.json(ve.getJSON().toString());
        return;
      }

      MongoCollection<Organization> orgCollection =
          db.getCollection("organization", Organization.class);
      Organization existingOrg = orgCollection.find(eq("orgName", org.getOrgName())).first();

      MongoCollection<User> userCollection = db.getCollection("user", User.class);
      User existingUser = userCollection.find(eq("username", user.getUsername())).first();

      if (existingOrg != null) {
        ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON().toString());
      } else if (existingUser != null) {
        ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().toString());
      } else {

        String passwordHash = securityUtils.hashPassword(password);
        if (passwordHash == null) {
          ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE.toJSON().toString());
          return;
        }

        user.setPassword(passwordHash);
        userCollection.insertOne(user);

        orgCollection.insertOne(org);
        ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toJSON().toString());
      }
    };
  }

  /*  Invite users through email under an organization with a JSON Object formatted as:
      {“senderName”: “senderName”,
               data: [
                      {
                          “firstName”:”exampleFirstName”,
                          “lastName”:”exampleLastName”,
                          “email”:”exampleEmail”,
                          “role”: “Worker”,
                      }
         ]
      }
  */
  public Handler inviteUsers(SecurityUtils securityUtils, EmailUtil emailUtil) {
    return ctx -> {
      JSONObject req = new JSONObject(ctx.body());
      JSONArray people = req.getJSONArray("data");

      String sender = req.getString("senderName");

      for (int i = 0; i < people.length(); i++) {
        JSONObject currInvite = people.getJSONObject(i);

        String email = currInvite.getString("email");

        String firstName = currInvite.getString("firstName");
        String lastName = currInvite.getString("lastName");
        String role = currInvite.getString("role");

        // Include checks for empty entries, could potentially include different error messages for
        // each field.
        if (email == null) {
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (firstName == null) {
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (lastName == null) {
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (role == null) {
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (ValidationUtils.isValidEmail(email)) {
          ctx.json(
              EmailMessages.NOT_VALID_EMAIL
                  .toJSON(firstName + lastName + "'s email is not a valid address")
                  .toString());
          return;
        }

        String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
        int expirationTime = 604800000; // 7 days
        String jwt =
            securityUtils.createOrgJWT(
                id, sender, firstName, lastName, role, "Invite User to Org", expirationTime);
        try {
          String emailJWT =
              emailUtil.getOrganizationInviteEmail(
                  "https://keep.id/invite-user/" + jwt, sender, firstName + " " + lastName);
          emailUtil.sendEmail(
              "Keep ID", email, sender + " has Invited you to Join their Organization", emailJWT);
        } catch (EmailExceptions e) {
          ctx.json(e.toJSON().toString());
        }
      }
      ctx.json(UserMessage.SUCCESS.toJSON().toString());
    };
  }
}
