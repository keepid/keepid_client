package Organization;

import Activity.ActivityController;
import Config.Message;
import Logger.LogFactory;
import Organization.Services.EnrollOrganizationService;
import Organization.Services.FindMemberService;
import Organization.Services.InviteUserService;
import Organization.Services.ListOrgsService;
import Security.EncryptionUtils;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;

public class OrganizationController {

  Logger logger;
  MongoDatabase db;
  ActivityController activityController;

  public static final String newOrgTestURL =
      Objects.requireNonNull(System.getenv("NEW_ORG_TESTURL"));
  public static final String newOrgActualURL =
      Objects.requireNonNull(System.getenv("NEW_ORG_ACTUALURL"));
  EncryptionUtils encryptionUtils;

  public OrganizationController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("OrgController");
    this.encryptionUtils = EncryptionUtils.getInstance();
    this.activityController = new ActivityController();
    this.logger = l.createLogger("OrgController");
  }
  //
  //  public Handler organizationSignupValidator =
  //      ctx -> {
  //        logger.info("Starting organizationSignupValidator");
  //        JSONObject req = new JSONObject(ctx.body());
  //
  //        logger.info("Getting fields from form");
  //        String orgName = req.getString("organizationName").strip();
  //        String orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
  //        String orgEIN = req.getString("organizationEIN").strip();
  //        String orgStreetAddress =
  // req.getString("organizationAddressStreet").toUpperCase().strip();
  //        String orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
  //        String orgState = req.getString("organizationAddressState").toUpperCase().strip();
  //        String orgZipcode = req.getString("organizationAddressZipcode").strip();
  //        String orgEmail = req.getString("organizationEmail").strip();
  //        String orgPhoneNumber = req.getString("organizationPhoneNumber").strip();
  //
  //        logger.info("Checking for existing organizations");
  //        MongoCollection<Organization> orgCollection =
  //            db.getCollection("organization", Organization.class);
  //        Organization existingOrg = orgCollection.find(eq("orgName", orgName)).first();
  //
  //        if (existingOrg != null) {
  //          logger.error("Attempted to sign-up org that already exists");
  //          ctx.json(OrgEnrollmentStatus.ORG_EXISTS.toJSON().toString());
  //          return;
  //        }
  //
  //        logger.info("Trying to create organization");
  //        try {
  //          new Organization(
  //              orgName,
  //              orgWebsite,
  //              orgEIN,
  //              orgStreetAddress,
  //              orgCity,
  //              orgState,
  //              orgZipcode,
  //              orgEmail,
  //              orgPhoneNumber);
  //          ctx.json(
  //              OrganizationValidationMessage.toOrganizationMessageJSON(
  //                      OrganizationValidationMessage.VALID)
  //                  .toString());
  //          logger.info("Organization created");
  //        } catch (ValidationException ve) {
  //          logger.error("Couldn't create organization object");
  //          ctx.json(ve.getJSON().toString());
  //        }
  //        logger.info("Done with organizationSignupValidator");
  //      };

  // Takes in a json object specifying
  // s and orgnames
  //
  //  {userTypes : [],
  //  organizations : []}
  public Handler findMembersOfOrgs =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONArray userTypes = req.getJSONArray("userTypes");
        JSONArray orgs = req.getJSONArray("organizations");
        FindMemberService fm = new FindMemberService(db, logger, userTypes, orgs);
        Message message = fm.executeAndGetResponse();
        JSONObject res = fm.getMembers();
        if (res == null) {
          res = new JSONObject();
        }
        res.put("status", message.getErrorName());
        res.put("message", message.getErrorDescription());
        ctx.result(res.toString());
      };

  public Handler listOrgs =
      ctx -> {
        ListOrgsService loservice = new ListOrgsService(db, logger);
        Message message = loservice.executeAndGetResponse();
        JSONArray orgs = loservice.getOrgs();
        JSONObject ret = new JSONObject();
        ret.put("status", message.getErrorName());
        ret.put("message", message.getErrorDescription());
        ret.put("organizations", orgs);
        ctx.result(ret.toString());
      };

  public Handler enrollOrganization =
      ctx -> {
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

        EnrollOrganizationService eoService =
            new EnrollOrganizationService(
                db,
                logger,
                firstName,
                lastName,
                birthDate,
                email,
                phone,
                address,
                city,
                state,
                zipcode,
                twoFactorOn,
                username,
                password,
                userLevel,
                orgName,
                orgWebsite,
                orgEIN,
                orgStreetAddress,
                orgCity,
                orgState,
                orgZipcode,
                orgEmail,
                orgPhoneNumber);
        ctx.result(eoService.executeAndGetResponse().toJSON().toString());
      };
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
  public Handler inviteUsers =
      ctx -> {
        logger.info("Starting inviteUsers handler");
        JSONObject req = new JSONObject(ctx.body());
        JSONArray people = req.getJSONArray("data");

        String sender = ctx.sessionAttribute("fullName");
        String org = ctx.sessionAttribute("orgName");

        InviteUserService iuservice = new InviteUserService(db, logger, people, sender, org);
        ctx.result(iuservice.executeAndGetResponse().toResponseString());
      };
}
