import Config.Env;
import Config.MongoConfig;
import Organization.OrganizationController;
import User.UserController;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.github.cdimascio.dotenv.Dotenv;
import io.javalin.Javalin;
import io.javalin.core.compression.Brotli;
import io.javalin.core.compression.Gzip;

public class App {

    public static Long ASYNC_TIME_OUT = 10L;

    public static void main(String[] args) {

        Dotenv dotenv = Env.getInstance();
        MongoClient client = MongoConfig.getMongoClient();
        MongoDatabase db = client.getDatabase(MongoConfig.getDatabaseName());

        Javalin app = Javalin.create(config -> {
            config.asyncRequestTimeout = ASYNC_TIME_OUT;        // timeout for async requests (default is 0, no timeout)
            config.autogenerateEtags = false;                    // auto generate etags (default is false)
            config.compressionStrategy(new Brotli(4),
                new Gzip(6));  // set the compression strategy and levels - since 3.2.0
            config.contextPath = "/";                       // context path for the http servlet (default is "/")
            config.defaultContentType = "text/plain";         // content type to use if no content type is set (default is "text/plain")
            config.dynamicGzip = true;                 // dynamically gzip http responses (default is true)
            config.enableCorsForAllOrigins();               // enable cors for all origins
            config
                .enableDevLogging();                       // enable extensive development logging for http and websocket
            config.enforceSsl = false;                  // redirect http traffic to https (default is false) -- setting to true breaks our code for now
            config.logIfServerNotStarted = true;       // log a warning if user doesn't start javalin instance (default is true)
            config.prefer405over404 = false;            // send a 405 if handlers exist for different verb on the same path (default is false)
//            config.requestLogger();                    // set a request logger
//            config.sessionHandler();                   // set a SessionHandler
        }).start(Integer.parseInt(dotenv.get("PORT_NUMBER")));

        // we need to instantiate the controllers with the database
        OrganizationController orgController = new OrganizationController(db);
        /*
         * Server API:
         *  /login
         *     - Takes {
         *          username: (Of the form <firstname>-<lastname>-<orgName>-<dateofbirth>)
         *          password:
         *      }
         *      as form parameters.
         *     - Logs a user in, given a username and password.
         *     - Sets proper privilege level.
         *
         *  /organization-signup
         *     - Takes {
         *          orgName:
         *          firstname:
         *          lastname:
         *          password:
         *          email:
         *      }
         *      as form parameters.
         *     - Adds the organization to the database, as well as the first admin.
         *     - Returns a status:
         *          - OrgEnrollmentStatus.PASS_HASH_FAILURE
         *          - OrgEnrollmentStatus.ORG_EXISTS
         *          - OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT
         *
         *  TODO: /create-user
         *     - Takes form params for creating new user, and adds to DB.
         *
         * TODO: /document
         *     - Takes userID and document name
         *
         * TODO: /put-documents
         *     - Adds a document to the user's db entry
         */

        app.before(ctx -> ctx.header("Access-Control-Allow-Credentials", "true"));

        app.get("/", ctx -> ctx.result("Welcome to the Keep.id Server"));
        app.post("/login", UserController.loginUser);
        app.post("/organization-signup", orgController.enrollOrganization);
        // app.post("/create-user", UserController.createUser);
    }
}
