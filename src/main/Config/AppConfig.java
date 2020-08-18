package Config;

import Bug.BugController;
import Logger.LogFactory;
import Organization.OrganizationController;
import PDF.PdfController;
import Security.AccountSecurityController;
import Security.EmailUtil;
import Security.SecurityUtils;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import io.javalin.core.JavalinServer;
import io.javalin.core.compression.Brotli;
import io.javalin.core.compression.Gzip;
import org.slf4j.Logger;

public class AppConfig {
  public static Long ASYNC_TIME_OUT = 10L;
  public static int SERVER_PORT = Integer.parseInt(System.getenv("PORT"));
  public static int SERVER_TEST_PORT = Integer.parseInt(System.getenv("TEST_PORT"));

  public static Javalin appFactory(DeploymentLevel deploymentLevel) {
    System.setProperty("logback.configurationFile", "../Logger/Resources/logback.xml");
    Javalin app = AppConfig.createJavalinApp(deploymentLevel);
    MongoConfig.getMongoClient();
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    setApplicationHeaders(app);

    /* Utilities to pass to route handlers */
    SecurityUtils securityUtils = new SecurityUtils();
    EmailUtil emailUtil = new EmailUtil();
    LogFactory l = new LogFactory();
    l.createLogger();

    // We need to instantiate the controllers with the database.
    OrganizationController orgController = new OrganizationController(db);
    UserController userController = new UserController(db);
    AccountSecurityController accountSecurityController = new AccountSecurityController(db);
    PdfController pdfController = new PdfController(db);
    BugController bugController = new BugController(db);

    /* -------------- DUMMY PATHS ------------------------- */
    app.get("/", ctx -> ctx.result("Welcome to the Keep.id Server"));

    /* -------------- FILE MANAGEMENT --------------------- */
    app.post("/upload", pdfController.pdfUpload);
    app.post("/download", pdfController.pdfDownload);
    app.post("/delete-document/", pdfController.pdfDelete);
    app.post("/get-documents", pdfController.pdfGetAll);
    app.post("/get-application-questions", pdfController.getApplicationQuestions);
    app.post("/fill-application", pdfController.fillPDFForm);

    /* -------------- USER AUTHENTICATION/USER RELATED ROUTES-------------- */
    app.post("/login", userController.loginUser(securityUtils, emailUtil));
    app.post("/generate-username", userController.generateUniqueUsername);
    app.post("/create-user-validator", userController.createUserValidator);
    app.post("/create-user", userController.createNewUser(securityUtils));
    app.get("/logout", userController.logout);
    app.post(
            "/forgot-password", accountSecurityController.forgotPassword(securityUtils, emailUtil));
    app.post("/change-password", accountSecurityController.changePasswordIn(securityUtils));
    app.post("/reset-password", accountSecurityController.resetPassword(securityUtils));
    app.get("/get-user-info", userController.getUserInfo);
    app.post("/two-factor", accountSecurityController.twoFactorAuth);
    app.post("/get-organization-members", userController.getMembers);

    /* -------------- AUTHORIZATION  ----------------------- */
    app.post("/modify-permissions", userController.modifyPermissions);

    /* -------------- ORGANIZATION SIGN UP ------------------ */
    app.post("/organization-signup-validator", orgController.organizationSignupValidator);
    app.post("/organization-signup", orgController.enrollOrganization(securityUtils));

    app.post("/invite-user", orgController.inviteUsers(securityUtils, emailUtil));

    /* -------------- ACCOUNT SETTINGS ------------------ */
    app.post(
            "/change-account-setting", accountSecurityController.changeAccountSetting(securityUtils));
    app.post("/change-two-factor-setting", accountSecurityController.change2FASetting);

    /* -------------- SUBMIT BUG------------------ */
    app.post("/submit-bug", bugController.submitBug);

    return app;
  }

  public static void setApplicationHeaders(Javalin app){
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
      case TEST: port = SERVER_TEST_PORT;
        break;
      default:
        throw new IllegalStateException("Remember to config your port according to: " + deploymentLevel);
    }
    return Javalin.create(
            config -> {
              config.asyncRequestTimeout =
                      ASYNC_TIME_OUT; // timeout for async requests (default is 0, no timeout)
              config.autogenerateEtags = false; // auto generate etags (default is false)
              config.compressionStrategy(
                      new Brotli(4), new Gzip(6)); // set the compression strategy and levels - since 3.2.0
              config.contextPath = "/"; // context path for the http servlet (default is "/")
              config.defaultContentType =
                      "text/plain"; // content type to use if no content type is set (default is
              // "text/plain")
              config.enableCorsForAllOrigins(); // enable cors for all origins
              config.enableDevLogging(); // enable extensive development logging for http and
              // websocket
              config.enforceSsl =
                      false; // redirect http traffic to https (default is false) -- setting to true
              // breaks our code for now
              // log a warning if user doesn't start javalin instance (default is true)
              config.logIfServerNotStarted = true;
              config.showJavalinBanner = false;
              config.prefer405over404 =
                      false; // send a 405 if handlers exist for different verb on the same path
              config.addStaticFiles("/");
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
            }).start(port);
  }

}
