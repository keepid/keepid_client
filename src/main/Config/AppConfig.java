package Config;

import Activity.ActivityController;
import Admin.AdminController;
import Billing.BillingController;
import Database.Organization.OrgDao;
import Database.Organization.OrgDaoFactory;
import Database.Token.TokenDao;
import Database.Token.TokenDaoFactory;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import Database.UserV2.UserV2Dao;
import Database.UserV2.UserV2DaoFactory;
import Issue.IssueController;
import Organization.Organization;
import Organization.OrganizationController;
import PDF.PdfController;
import Production.ProductionController;
import Security.AccountSecurityController;
import Security.EncryptionUtils;
import User.User;
import User.UserController;
import User.UserControllerV2;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import io.javalin.http.HttpResponseException;
import org.bson.types.ObjectId;

import java.util.HashMap;
import java.util.Optional;

public class AppConfig {
  public static Long ASYNC_TIME_OUT = 10L;
  public static int SERVER_PORT = Integer.parseInt(System.getenv("PORT"));
  public static int SERVER_TEST_PORT = Integer.parseInt(System.getenv("TEST_PORT"));

  public static Javalin appFactory(DeploymentLevel deploymentLevel) {
    System.setProperty("logback.configurationFile", "../Logger/Resources/logback.xml");
    Javalin app = AppConfig.createJavalinApp(deploymentLevel);
    MongoConfig.getMongoClient();
    UserDao userDao = UserDaoFactory.create(deploymentLevel);
    UserV2Dao userV2Dao = UserV2DaoFactory.create(deploymentLevel);
    TokenDao tokenDao = TokenDaoFactory.create(deploymentLevel);
    OrgDao orgDao = OrgDaoFactory.create(deploymentLevel);
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    setApplicationHeaders(app);

    EncryptionUtils.initialize();
    //    try {
    //      encryptionController = new EncryptionController(db);
    //    } catch (GeneralSecurityException | IOException e) {
    //      System.err.println(e.getStackTrace());
    //      System.exit(0);
    //      return null;
    //    }

    // We need to instantiate the controllers with the database.
    OrganizationController orgController = new OrganizationController(db);
    UserController userController = new UserController(userDao, tokenDao, db);
    AccountSecurityController accountSecurityController =
        new AccountSecurityController(userDao, tokenDao);
    PdfController pdfController = new PdfController(db, userDao);
    IssueController issueController = new IssueController(db);
    ActivityController activityController = new ActivityController();
    AdminController adminController = new AdminController(userDao, db);
    ProductionController productionController = new ProductionController(orgDao, userDao);
    UserControllerV2 userControllerV2 = new UserControllerV2(userV2Dao);
    BillingController billingController = new BillingController();

    /* -------------- DUMMY PATHS ------------------------- */
    app.get("/", ctx -> ctx.result("Welcome to the Keep.id Server"));

    /* -------------- FILE MANAGEMENT --------------------- */
    app.post("/upload", pdfController.pdfUpload);
    app.post("/upload-annotated", pdfController.pdfUploadAnnotated);
    app.post("/upload-signed-pdf", pdfController.pdfSignedUpload);
    app.post("/download", pdfController.pdfDownload);
    app.post("/delete-document/", pdfController.pdfDelete);
    app.post("/get-documents", pdfController.pdfGetDocuments);
    app.post("/get-application-questions", pdfController.getApplicationQuestions);
    app.post("/fill-application", pdfController.fillPDFForm);

    /* -------------- USER AUTHENTICATION/USER RELATED ROUTES-------------- */
    app.post("/login", userController.loginUser);
    app.post("/authenticate", userController.authenticateUser);
    app.post("/create-user", userController.createNewUser);
    app.post("/create-invited-user", userController.createNewInvitedUser);
    app.get("/logout", userController.logout);
    app.post("/forgot-password", accountSecurityController.forgotPassword);
    app.post("/change-password", accountSecurityController.changePassword);
    app.post("/reset-password", accountSecurityController.resetPassword);
    app.post("/get-user-info", userController.getUserInfo);
    app.post("/two-factor", accountSecurityController.twoFactorAuth);
    app.post("/get-organization-members", userController.getMembers);
    app.post("/get-login-history", userController.getLogInHistory);
    app.post("/upload-pfp", userController.uploadPfp);
    app.post("/load-pfp", userController.loadPfp);
    app.post("/username-exists", userController.usernameExists);
    app.post("/delete-user", userController.deleteUser);

    /* -------------- ORGANIZATION SIGN UP ------------------ */
    //    app.post("/organization-signup-validator", orgController.organizationSignupValidator);
    app.post("/organization-signup", orgController.enrollOrganization);

    app.post("/invite-user", orgController.inviteUsers);

    /* -------------- ACCOUNT SETTINGS ------------------ */
    app.post("/change-account-setting", accountSecurityController.changeAccountSetting);
    app.post("/change-two-factor-setting", accountSecurityController.change2FASetting);

    /* -------------- SUBMIT BUG------------------ */
    app.post("/submit-issue", issueController.submitIssue);

    /* -------------- ADMIN DASHBOARD ------------------ */
    app.post("/get-usertype-count", orgController.findMembersOfOrgs);
    app.post("/test-delete-org", adminController.testDeleteOrg);
    app.post("/delete-org", adminController.deleteOrg);

    /* --------------- SEARCH FUNCTIONALITY ------------- */
    app.post("/get-all-orgs", orgController.listOrgs);
    app.post("/get-all-activities", activityController.findMyActivities);

    /* --------------- PRODUCTION API --------------- */

    // TODO use Access manager for this instead https://javalin.io/documentation#access-manager
    app.before(
        "/organizations*",
        ctx -> {
          String sessionUsername = ctx.sessionAttribute("username");

          var sessionUser = userDao.get(sessionUsername);

          if (sessionUsername == null || sessionUsername.isEmpty() || sessionUser.isEmpty()) {
            throw new HttpResponseException(401, "Authentication failed", new HashMap<>());
          } else if (sessionUser.get().getUserType() != UserType.Developer) {
            throw new HttpResponseException(403, "Insufficient permissions", new HashMap<>());
          }
        });

    app.get("/organizations", productionController.readAllOrgs);
    app.post("/organizations", productionController.createOrg);

    app.before(
        "/organizations/:orgId",
        ctx -> {
          ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
          Optional<Organization> organizationOptional = orgDao.get(objectId);

          if (organizationOptional.isEmpty()) {
            throw new HttpResponseException(
                404,
                "Organization with id '" + objectId.toHexString() + "' not found",
                new HashMap<>());
          }
        });
    app.get("/organizations/:orgId", productionController.readOrg);
    app.patch("/organizations/:orgId", productionController.updateOrg);
    app.delete("/organizations/:orgId", productionController.deleteOrg);
    app.get("/organizations/:orgId/users", productionController.getUsersFromOrg);

    app.before(
        "/users*",
        ctx -> {
          if (ctx.method().equals("OPTIONS")) {
            return;
          }

          String sessionUsername = ctx.sessionAttribute("username");
          var sessionUser = userDao.get(sessionUsername);

          if (sessionUsername == null || sessionUsername.isEmpty() || sessionUser.isEmpty()) {
            throw new HttpResponseException(401, "Authentication failed", new HashMap<>());
          } else if (sessionUser.get().getUserType() != UserType.Developer) {
            throw new HttpResponseException(403, "Insufficient permissions", new HashMap<>());
          }
        });

    app.get("/users", productionController.readAllUsers);
    app.post("/users", productionController.createUser);

    app.before(
        "/users/:username",
        ctx -> {
          String username = ctx.pathParam("username");
          Optional<User> userOptional = userDao.get(username);

          if (userOptional.isEmpty()) {
            throw new HttpResponseException(
                404, "User with username '" + username + "' not found", new HashMap<>());
          }
        });

    app.get("/users/:username", productionController.readUser);
    app.patch("/users/:username", productionController.updateUser);
    app.delete("/users/:username", productionController.deleteUser);

    /* --------------- SEARCH FUNCTIONALITY ------------- */
    app.post("/signup", userControllerV2.signup);
    app.patch("/users/:id", userControllerV2.addInformation);
    app.get("/info/:id", userControllerV2.getInformation);

    /* -------------- Billing ----------------- */
    app.get("/donation-generate-client-token", billingController.donationGenerateClientToken);
    app.post("/donation-checkout", billingController.donationCheckout);

    return app;
  }

  public static void setApplicationHeaders(Javalin app) {
    app.before(
        ctx -> {
          ctx.header("Content-Security-Policy", "script-src 'self' 'unsafe-inline';");
          ctx.header("X-Frame-Options", "SAMEORIGIN");
          ctx.header("X-Xss-Protection", "1; mode=block");
          ctx.header("X-Content-Type-Options", "nosniff");
          ctx.header("Referrer-Policy", "no-referrer-when-downgrade");
          ctx.header("Access-Control-Allow-Credentials", "true");
        });
  }

  public static Javalin createJavalinApp(DeploymentLevel deploymentLevel) {
    int port;
    switch (deploymentLevel) {
      case STAGING:
      case PRODUCTION:
        port = SERVER_PORT;
        break;
      case TEST:
        port = SERVER_TEST_PORT;
        break;
      default:
        throw new IllegalStateException(
            "Remember to config your port according to: " + deploymentLevel);
    }
    return Javalin.create(
            config -> {
              config.asyncRequestTimeout =
                  ASYNC_TIME_OUT; // timeout for async requests (default is 0, no timeout)
              config.autogenerateEtags = false; // auto generate etags (default is false)
              config.contextPath = "/"; // context path for the http servlet (default is "/")
              config.defaultContentType =
                  "text/plain"; // content type to use if no content type is set (default is
              // "text/plain")

              config.enableCorsForAllOrigins(); // enable cors for all origins

              config.enableDevLogging(); // enable extensive development logging for
              // http and
              // websocket
              config.enforceSsl = false;
              // log a warning if user doesn't start javalin instance (default is true)
              config.logIfServerNotStarted = true;
              config.showJavalinBanner = false;
              config.prefer405over404 =
                  false; // send a 405 if handlers exist for different verb on the same path
              // (default is false)
              config.sessionHandler(
                  () -> {
                    try {
                      return SessionConfig.getSessionHandlerInstance(deploymentLevel);
                    } catch (Exception e) {
                      System.err.println("Unable to instantiate session handler.");
                      e.printStackTrace();
                      System.exit(1);
                      return null;
                    }
                  });
            })
        .start(port);
  }
}
