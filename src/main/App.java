import Config.MongoConfig;
import Config.SessionConfig;
import Logger.LogFactory;
import Organization.OrganizationController;
import PDF.*;
import Security.AccountSecurityController;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import io.javalin.core.compression.Brotli;
import io.javalin.core.compression.Gzip;
import org.slf4j.Logger;

public class App {

  public static Long ASYNC_TIME_OUT = 10L;

  public static void main(String[] args) {
    System.setProperty("logback.configurationFile", "./logger/resources/logback.xml");
    MongoClient client = MongoConfig.getMongoClient();
    MongoDatabase db = client.getDatabase(MongoConfig.getDatabaseName());

    Javalin app =
        Javalin.create(
                config -> {
                  config.asyncRequestTimeout =
                      ASYNC_TIME_OUT; // timeout for async requests (default is 0, no timeout)
                  config.autogenerateEtags = false; // auto generate etags (default is false)
                  config.compressionStrategy(
                      new Brotli(4),
                      new Gzip(6)); // set the compression strategy and levels - since 3.2.0
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
                  config.logIfServerNotStarted =
                      true; // log a warning if user doesn't start javalin instance (default is
                  // true)
                  config.prefer405over404 =
                      false; // send a 405 if handlers exist for different verb on the same path
                  // (default is false)
                  config.sessionHandler(
                      () -> {
                        try {
                          return SessionConfig.getSessionHandlerInstance();
                        } catch (Exception e) {
                          System.err.println("Unable to instantiate session handler.");
                          e.printStackTrace();
                          System.exit(1);
                          return null;
                        }
                      });
                })
            .start(Integer.parseInt(System.getenv("PORT")));
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger();
    logger.warn("EXAMPLE OF WARN");
    logger.error("EXAMPLE OF ERROR");
    logger.debug("EXAMPLE OF DEBUG");

    // We need to instantiate the controllers with the database.
    OrganizationController orgController = new OrganizationController(db);
    UserController userController = new UserController(db);
    AccountSecurityController accountSecurityController = new AccountSecurityController(db);
    PdfApplication pdfApplication = new PdfApplication(db);
    PdfUpload pdfUpload = new PdfUpload(db);
    PdfDownload pdfDownload = new PdfDownload(db);
    PdfSearch pdfSearch = new PdfSearch(db);
    PdfDelete pdfDelete = new PdfDelete(db);

    /* -------------- BEFORE FILTERS ---------------------- */
    app.before(ctx -> ctx.header("Access-Control-Allow-Credentials", "true"));

    /* -------------- DUMMY PATHS ------------------------- */
    app.get("/", ctx -> ctx.result("Welcome to the Keep.id Server"));

    /* -------------- FILE MANAGEMENT --------------------- */
    app.post("/upload", pdfUpload.pdfUpload);
    app.post("/download", pdfDownload.pdfDownload);
    app.get("/delete-document/:fileId", pdfDelete.pdfDelete);
    app.post("/get-documents", pdfSearch.pdfSearch);
    app.post("/get-organization-members", userController.getMembers);
    app.post("/fill-application", pdfApplication.fillPDFForm);

    /* -------------- USER AUTHENTICATION/USER RELATED ROUTES-------------- */
    app.post("/login", userController.loginUser);
    app.post("/generate-username", userController.generateUniqueUsername);
    app.post("/create-user-validator", userController.createUserValidator);
    app.post("/create-user", userController.createNewUser);
    app.get("/logout", userController.logout);
    app.post("/forgot-password", accountSecurityController.forgotPassword);
    app.post("change-password", accountSecurityController.changePasswordIn);
    app.post("/reset-password/:jwt", accountSecurityController.resetPassword);
    app.get("/get-user-info", userController.getUserInfo);
    app.post("/two-factor", accountSecurityController.twoFactorAuth);

    /* -------------- AUTHORIZATION  ----------------------- */
    app.post("/modify-permissions", userController.modifyPermissions);

    /* -------------- ORGANIZATION SIGNUP ------------------ */
    app.post("/organization-signup-validator", orgController.organizationSignupValidator);
    app.post("/organization-signup", orgController.enrollOrganization);

    /* -------------- ACCOUNT SETTINGS ------------------ */
    app.post("/change-account-setting", accountSecurityController.changeAccountSetting);
  }
}
