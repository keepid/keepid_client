import Config.AppConfig;
import Config.MongoConfig;
import Logger.LogFactory;
import Organization.OrganizationController;
import PDF.PdfController;
import Security.AccountSecurityController;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import org.slf4j.Logger;

public class App {

  public static void main(String[] args) {
    System.setProperty("logback.configurationFile", "./logger/resources/logback.xml");
    MongoClient client = MongoConfig.getMongoClient();
    MongoDatabase db = client.getDatabase(MongoConfig.getDatabaseName());

    Javalin app = AppConfig.createJavalinApp();
    app.start(Integer.parseInt(System.getenv("PORT")));

    LogFactory l = new LogFactory();
    Logger logger = l.createLogger();
    logger.warn("EXAMPLE OF WARN");
    logger.error("EXAMPLE OF ERROR");
    logger.debug("EXAMPLE OF DEBUG");

    // We need to instantiate the controllers with the database.
    OrganizationController orgController = new OrganizationController(db);
    UserController userController = new UserController(db);
    AccountSecurityController accountSecurityController = new AccountSecurityController(db);
    PdfController pdfController = new PdfController(db);

    /* -------------- BEFORE FILTERS ---------------------- */
    app.before(ctx -> ctx.header("Access-Control-Allow-Credentials", "true"));

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
    app.post("/login", userController.loginUser);
    app.post("/generate-username", userController.generateUniqueUsername);
    app.post("/create-user-validator", userController.createUserValidator);
    app.post("/create-user", userController.createNewUser);
    app.get("/logout", userController.logout);
    app.post("/forgot-password", accountSecurityController.forgotPassword);
    app.post("/change-password", accountSecurityController.changePasswordIn);
    app.post("/reset-password", accountSecurityController.resetPassword);
    app.get("/get-user-info", userController.getUserInfo);
    app.post("/two-factor", accountSecurityController.twoFactorAuth);
    app.post("/get-organization-members", userController.getMembers);

    /* -------------- AUTHORIZATION  ----------------------- */
    app.post("/modify-permissions", userController.modifyPermissions);

    /* -------------- ORGANIZATION SIGNUP ------------------ */
    app.post("/organization-signup-validator", orgController.organizationSignupValidator);
    app.post("/organization-signup", orgController.enrollOrganization);

    /* -------------- ACCOUNT SETTINGS ------------------ */
    app.post("/change-account-setting", accountSecurityController.changeAccountSetting);
  }
}
