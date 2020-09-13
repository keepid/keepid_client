package Organization;

import Bug.BugController;
import Logger.LogFactory;
import Security.EmailExceptions;
import Security.EmailUtil;
import Security.EncryptionObjectController;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class OrganizationController {

  Logger logger;
  MongoDatabase db;
  public static final String newOrgTestURL =
      Objects.requireNonNull(System.getenv("NEW_ORG_TESTURL"));
  public static final String newOrgActualURL =
      Objects.requireNonNull(System.getenv("NEW_ORG_ACTUALURL"));
  EncryptionObjectController encryptionObjectController;

  public OrganizationController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("OrgController");
    this.encryptionObjectController = new EncryptionObjectController(db);
  }

  public Handler organizationSignupValidator =
      ctx -> {
        logger.info("Starting organizationSignupValidator");
        JSONObject req = new JSONObject(ctx.body());

        logger.info("Getting fields from form");
        String orgName = req.getString("organizationName").strip();
        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
        String orgEIN = req.getString("organizationEIN").strip();
        String orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
        String orgZipcode = req.getString("organizationAddressZipcode").strip();
        String orgEmail = req.getString("organizationEmail").strip();
        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();

        logger.info("Checking for existing organizations");
        MongoCollection<Organization> orgCollection =
            db.getCollection("organization", Organization.class);
        Organization existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        if (existingOrg != null) {
          logger.error("Attempted to sign-up org that already exists");
          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON().toString());
          return;
        }

        logger.info("Trying to create organization");
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
          logger.info("Organization created");
        } catch (ValidationException ve) {
          logger.error("Couldn't create organization object");
          ctx.json(ve.getJSON().toString());
        }
        logger.info("Done with organizationSignupValidator");
      };

  // Takes in a json object specifying usertypes and orgnames
  //
  //  {userTypes : [],
  //  organizations : []}
  public Handler findMembersOfOrgs =
      ctx -> {
        JSONObject ret = new JSONObject();

        JSONObject req = new JSONObject(ctx.body());
        JSONArray userTypes = req.getJSONArray("userTypes");
        JSONArray orgs = req.getJSONArray("organizations");
        if (userTypes.isEmpty()) {
          logger.error("userTypes cannot be empty");
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        MongoCollection<User> userCollection = db.getCollection("user", User.class);

        logger.info("Counting usertypes");
        if (orgs.isEmpty()) {
          ret = emptyOrgCountMembers(userTypes, userCollection);

        } else {
          ret = numOrgCountMembers(userTypes, orgs, userCollection);
        }
        if (ret.has("fail")) {
          String invalidType = ret.getString("invalidType");
          logger.error("Invalid Usertype: " + invalidType);
          ctx.json(UserMessage.INVALID_PARAMETER.toJSON().toString());
          return;
        }

        ret.put("status", UserMessage.SUCCESS.getErrorName());
        ret.put("message", UserMessage.SUCCESS.getErrorDescription());

        logger.info("Successfully returned member information");
        ctx.json(ret.toString());
      };

  private static JSONObject emptyOrgCountMembers(
      JSONArray userTypes, MongoCollection<User> userCollection) {
    JSONObject ret = new JSONObject();
    for (int i = 0; i < userTypes.length(); i++) {
      String currType = userTypes.getString(i);
      switch (currType) {
        case "client":
          long client = userCollection.countDocuments(eq("privilegeLevel", "Client"));
          ret.put("clients", client);
          break;
        case "worker":
          long worker = userCollection.countDocuments(eq("privilegeLevel", "Worker"));
          ret.put("workers", worker);
          break;
        case "admin":
          long admin = userCollection.countDocuments(eq("privilegeLevel", "Admin"));
          ret.put("admins", admin);
          break;
        case "director":
          long director = userCollection.countDocuments(eq("privilegeLevel", "Director"));
          ret.put("directors", director);
          break;
        default:
          ret.put("fail", "True");
          ret.put("invalidType", currType);
          return ret;
      }
    }
    return ret;
  }

  private static JSONObject numOrgCountMembers(
      JSONArray userTypes, JSONArray orgs, MongoCollection<User> userCollection) {
    JSONObject ret = new JSONObject();
    List<String> typesList = new ArrayList<String>();
    long client = 0;
    long worker = 0;
    long admin = 0;
    long director = 0;
    for (int i = 0; i < orgs.length(); i++) {
      for (int u = 0; u < userTypes.length(); u++) {
        String currType = userTypes.getString(u);
        String currOrg = orgs.getString(i);
        typesList.add(currType);
        switch (currType) {
          case "client":
            client +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Client")));
            break;
          case "worker":
            worker +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Worker")));
            break;
          case "admin":
            admin +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Admin")));
            break;
          case "director":
            director +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Director")));
            break;
          default:
            ret.put("fail", "True");
            ret.put("invalidType", currType);
            return ret;
        }
      }
    }

    if (typesList.contains("client")) {
      ret.put("clients", client);
    }
    if (typesList.contains("worker")) {
      ret.put("workers", worker);
    }
    if (typesList.contains("admin")) {
      ret.put("admins", admin);
    }
    if (typesList.contains("director")) {
      ret.put("directors", director);
    }

    return ret;
  }

  public Handler listOrgs =
      ctx -> {
        JSONObject ret = new JSONObject();
        JSONArray orgs = new JSONArray();

        logger.info("Querying organizations from Mongo");
        MongoCollection<Organization> orgCollection =
            db.getCollection("organization", Organization.class);
        MongoCursor<Organization> orgCursor = orgCollection.find().iterator();

        while (orgCursor.hasNext()) {
          JSONObject curr = new JSONObject(orgCursor.next());
          orgs.put(curr);
        }

        logger.info("Done creating JSON array of organizations");
        ret.put("status", UserMessage.SUCCESS.getErrorName());
        ret.put("message", UserMessage.SUCCESS.getErrorDescription());
        ret.put("organizations", orgs);

        logger.info("Done with listOrgs");
        ctx.json(ret.toString());
      };

  public Handler enrollOrganization(SecurityUtils securityUtils) {
    return ctx -> {
      logger.info("Starting enrollOrganization handler");
      JSONObject req = new JSONObject(ctx.body());

      logger.info("Getting fields from form");
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

      logger.info("Attempting to create user and organization");
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
        logger.error("Could not create user and/or org");
        ctx.json(ve.getJSON().toString());
        return;
      }

      logger.info("Checking for existing user and organization");
      MongoCollection<Organization> orgCollection =
          db.getCollection("organization", Organization.class);
      Organization existingOrg = orgCollection.find(eq("orgName", org.getOrgName())).first();

      MongoCollection<User> userCollection = db.getCollection("user", User.class);
      User existingUser = userCollection.find(eq("username", user.getUsername())).first();

      if (existingOrg != null) {
        logger.error("Organization already exists");
        ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON().toString());
      } else if (existingUser != null) {
        logger.error("User already exists");
        ctx.json(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().toString());
      } else {
        logger.info("Org and User are OK, hashing password");
        String passwordHash = securityUtils.hashPassword(password);
        if (passwordHash == null) {
          ctx.json(OrgEnrollmentStatus.PASS_HASH_FAILURE.toJSON().toString());
          return;
        }

        logger.info("Setting password and inserting user and org into Mongo");
        user.setPassword(passwordHash);
        encryptionObjectController.encryptUser(user);
        userCollection.insertOne(user);

        orgCollection.insertOne(org);
        logger.info("Notifying Slack about new org");
        HttpResponse posted = makeBotMessage(org);
        if (!posted.isSuccess()) {
          logger.error("Failed to notify Slack about new org");
          JSONObject body = new JSONObject();
          body.put(
              "text",
              "You are receiving this because an new organization signed up but wasn't successfully "
                  + "posted on Slack.");
          Unirest.post(BugController.bugReportActualURL).body(body.toString()).asEmpty();
        }
        ctx.json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toJSON().toString());
        logger.info("Done with enrollOrganization");
      }
    };
  }

  private HttpResponse makeBotMessage(Organization org) {
    JSONArray blocks = new JSONArray();
    JSONObject titleJson = new JSONObject();
    JSONObject titleText = new JSONObject();
    titleText.put("text", "*Organization Name: * " + org.getOrgName());
    titleText.put("type", "mrkdwn");
    titleJson.put("type", "section");
    titleJson.put("text", titleText);
    blocks.put(titleJson);
    JSONObject desJson = new JSONObject();
    JSONObject desText = new JSONObject();
    desText.put("text", "*Orgnization Contact: * " + org.getOrgEmail());
    desText.put("type", "mrkdwn");
    desJson.put("text", desText);
    desJson.put("type", "section");
    blocks.put(desJson);
    JSONObject input = new JSONObject();
    input.put("blocks", blocks);

    HttpResponse posted =
        Unirest.post(newOrgActualURL)
            .header("accept", "application/json")
            .body(input.toString())
            .asEmpty();
    return posted;
  }
  /*  Invite users through email under an organization with a JSON Object formatted as:
      {“senderName”: “senderName”,
       "organization": "orgName",
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
      logger.info("Starting inviteUsers handler");
      JSONObject req = new JSONObject(ctx.body());
      JSONArray people = req.getJSONArray("data");

      String sender = ctx.sessionAttribute("fullName");
      String org = ctx.sessionAttribute("orgName");

      if (org.isEmpty()) {
        logger.error("Empty organization field");
        ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
        return;
      }

      logger.info("Checking for empty fields");
      // Checking for any empty entries before sending out any emails
      for (int u = 0; u < people.length(); u++) {

        JSONObject currInvite = people.getJSONObject(u);

        String email = currInvite.getString("email");
        String firstName = currInvite.getString("firstName");
        String lastName = currInvite.getString("lastName");
        String role = currInvite.getString("role");

        // Include checks for empty entries, could potentially include different error messages for
        // each field.
        if (email.isEmpty()) {
          logger.error("Empty email field");
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (firstName.isEmpty()) {
          logger.error("Empty first name field");
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (lastName.isEmpty()) {
          logger.error("Empty last name field");
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
        if (role.isEmpty()) {
          logger.error("Empty role field");
          ctx.json(UserMessage.EMPTY_FIELD.toJSON().toString());
          return;
        }
      }

      logger.info("Generating JWTs and emails for organization invites");
      for (int i = 0; i < people.length(); i++) {
        JSONObject currInvite = people.getJSONObject(i);

        String email = currInvite.getString("email");
        String firstName = currInvite.getString("firstName");
        String lastName = currInvite.getString("lastName");
        String role = currInvite.getString("role");

        String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
        int expirationTime = 604800000; // 7 days
        String jwt =
            securityUtils.createOrgJWT(
                id, sender, firstName, lastName, role, "Invite User to Org", org, expirationTime);

        // NEED TO UPDATE URL IN JWT TO ORG INVITE WEBSITE
        try {
          String emailJWT =
              emailUtil.getOrganizationInviteEmail(
                  "https://keep.id/create-user/" + jwt, sender, firstName + " " + lastName);
          emailUtil.sendEmail(
              "Keep ID", email, sender + " has Invited you to Join their Organization", emailJWT);
        } catch (EmailExceptions e) {
          logger.error("Email exception caught");
          ctx.json(e.toJSON().toString());
        }
      }

      logger.info("All emails sent");
      ctx.json(UserMessage.SUCCESS.toJSON().toString());
      logger.info("Done with inviteUsers");
    };
  }
}
