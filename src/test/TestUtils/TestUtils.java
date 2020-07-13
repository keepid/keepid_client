package TestUtils;

import Config.MongoConfig;
import Organization.Organization;
import PDF.PdfController;
import Security.AccountSecurityController;
import Security.Tokens;
import User.User;
import User.UserController;
import User.UserType;
import Validation.ValidationException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.Javalin;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

public class TestUtils {
  private static MongoDatabase testDB =
      MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
  private static int serverPort = 1234;
  private static String serverUrl = "http://localhost:" + serverPort;
  private static Javalin app = null;

  /* Load the test database with:
   * Admins of Broad Street Ministry and YMCA
   * Workers with all sets of permissions, labelled with flags denoting their permission level, i.e. fft denotes
   * permission levels set to false, false, true for canView, canEdit, canRegister.
   * 2 clients each.
   *
   * In addition, several test users for 2FA, password, and settings routes
   *
   * Passwords are the same as usernames.
   */
  public static void setUpTestDB() throws ValidationException {
    // If there are entries in the database, they should be cleared before more are added.
    TestUtils.tearDownTestDB();
    MongoConfig.getMongoTestClient();

    /* *********************** Broad Street Ministry ************************ */
    Organization broadStreetMinistry =
        new Organization(
            "Broad Street Ministry",
            "http://www.broadstreetministry.org",
            "123456789",
            "311 Broad Street",
            "Philadelphia",
            "PA",
            "19104",
            "mikedahl@broadstreetministry.org",
            "1234567890");

    User adminBSM =
        new User(
            "Mike",
            "Dahl",
            "06-16-1960",
            "mikedahl@broadstreetministry.org",
            "1234567890",
            "Broad Street Ministry",
            "311 Broad Street",
            "Philadelphia",
            "PA",
            "19104",
            false,
            "adminBSM",
            TestUtils.hashPassword("adminBSM"),
            UserType.Director);

    User workerFffBSM =
        new User(
                "Worker",
                "Fff",
                "12-14-1997",
                "workerfff@broadstreetministry.org",
                "2157354847",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workerfffBSM",
                TestUtils.hashPassword("workerfffBSM"),
                UserType.Worker)
            .setCanEdit(false)
            .setCanView(false)
            .setCanRegister(false);

    User workerFftBSM =
        new User(
                "Worker",
                "Fft",
                "09-04-1978",
                "workerfft@broadstreetministry.org",
                "2152839504",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workerfftBSM",
                TestUtils.hashPassword("workerfftBSM"),
                UserType.Worker)
            .setCanEdit(false)
            .setCanView(false)
            .setCanRegister(true);

    User workerTffBSM =
        new User(
                "Worker",
                "Tff",
                "09-04-1978",
                "workertff@broadstreetministry.org",
                "2152839504",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workertffBSM",
                TestUtils.hashPassword("workertffBSM"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(false)
            .setCanRegister(false);

    User workerTftBSM =
        new User(
                "Worker",
                "Tft",
                "09-14-1978",
                "workertft@broadstreetministry.org",
                "2152839204",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workertftBSM",
                TestUtils.hashPassword("workertftBSM"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(false)
            .setCanRegister(true);

    User workerTtfBSM =
        new User(
                "Worker",
                "Ttf",
                "09-14-1978",
                "workerttf@broadstreetministry.org",
                "2152812204",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workerttfBSM",
                TestUtils.hashPassword("workerttfBSM"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(true)
            .setCanRegister(false);

    User workerTttBSM =
        new User(
                "Worker",
                "Ttt",
                "09-14-1978",
                "workerttt@broadstreetministry.org",
                "2152839204",
                "Broad Street Ministry",
                "311 Broad Street",
                "Philadelphia",
                "PA",
                "19104",
                false,
                "workertttBSM",
                TestUtils.hashPassword("workertttBSM"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(true)
            .setCanRegister(true);

    User client1BSM =
        new User(
            "Client",
            "Bsm",
            "09-14-1978",
            "clien1@broadstreetministry.org",
            "2152839204",
            "Broad Street Ministry",
            "311 Broad Street",
            "Philadelphia",
            "PA",
            "19104",
            false,
            "client1BSM",
            TestUtils.hashPassword("client1BSM"),
            UserType.Client);

    User client2BSM =
        new User(
            "Steffen",
            "Cornwell",
            "09-14-1997",
            "steffen@broadstreetministry.org",
            "2152839204",
            "Broad Street Ministry",
            "311 Broad Street",
            "Philadelphia",
            "PA",
            "19104",
            false,
            "client2BSM",
            TestUtils.hashPassword("client2BSM"),
            UserType.Client);

    /* ******************** YMCA **************************** */
    Organization ymca =
        new Organization(
            "YMCA",
            "http://www.ymca.net",
            "987654321",
            "11088 Knights Rd",
            "Philadelphia",
            "PA",
            "19154",
            "info@ymca.net",
            "1234567890");

    User adminYMCA =
        new User(
            "Ym",
            "Ca",
            "06-16-1960",
            "info@ymca.net",
            "1234567890",
            "YMCA",
            "11088 Knights Road",
            "Philadelphia",
            "PA",
            "19154",
            false,
            "adminYMCA",
            TestUtils.hashPassword("adminYMCA"),
            UserType.Director);

    User workerFffYMCA =
        new User(
                "Worker",
                "Fff",
                "12-14-1997",
                "workerfff@ymca.net",
                "2157354847",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workerfffYMCA",
                TestUtils.hashPassword("workerfffYMCA"),
                UserType.Worker)
            .setCanEdit(false)
            .setCanView(false)
            .setCanRegister(false);

    User workerFftYMCA =
        new User(
                "Worker",
                "Fft",
                "09-04-1978",
                "workerfft@ymca.net",
                "2152839504",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workerfftYMCA",
                TestUtils.hashPassword("workerfftYMCA"),
                UserType.Worker)
            .setCanEdit(false)
            .setCanView(false)
            .setCanRegister(true);

    User workerTffYMCA =
        new User(
                "Worker",
                "Tff",
                "09-04-1978",
                "workertff@ymca.net",
                "2152839504",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workertffYMCA",
                TestUtils.hashPassword("workertffYMCA"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(false)
            .setCanRegister(false);

    User workerTftYMCA =
        new User(
                "Worker",
                "Tft",
                "09-14-1978",
                "workertft@ymca.net",
                "2152839204",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workertftYMCA",
                TestUtils.hashPassword("workertftYMCA"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(false)
            .setCanRegister(true);

    User workerTtfYMCA =
        new User(
                "Worker",
                "Ttf",
                "09-14-1978",
                "workerttf@ymca.net",
                "2152812204",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workerttfYMCA",
                TestUtils.hashPassword("workerttfYMCA"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(true)
            .setCanRegister(false);

    User workerTttYMCA =
        new User(
                "Worker",
                "Ttt",
                "09-14-1978",
                "workerttt@ymca.net",
                "2152839204",
                "YMCA",
                "11088 Knights Road",
                "Philadelphia",
                "PA",
                "19154",
                false,
                "workertttYMCA",
                TestUtils.hashPassword("workertttYMCA"),
                UserType.Worker)
            .setCanEdit(true)
            .setCanView(true)
            .setCanRegister(true);

    User client1YMCA =
        new User(
            "Client",
            "Ymca",
            "09-14-1978",
            "clien1@ymca.net",
            "2152839204",
            "YMCA",
            "11088 Knights Road",
            "Philadelphia",
            "PA",
            "19154",
            false,
            "client1YMCA",
            TestUtils.hashPassword("client1YMCA"),
            UserType.Client);

    User client2YMCA =
        new User(
            "Steffen",
            "Cornwell",
            "09-14-1997",
            "steffen@ymca.net",
            "2152839204",
            "YMCA",
            "11088 Knights Road",
            "Philadelphia",
            "PA",
            "19154",
            false,
            "client2YMCA",
            TestUtils.hashPassword("client2YMCA"),
            UserType.Client);

    /* *********************** 2FA Token Test Users ************************ */

    Organization twoFactorTokenOrg =
            new Organization(
                    "2FA Token Org",
                    "http://keep.id",
                    "123456789",
                    "311 Broad Street",
                    "Philadelphia",
                    "PA",
                    "19104",
                    "contact@example.com",
                    "1234567890");

    User tokenTestValid =
            new User(
                    "Token",
                    "Test",
                    "06-25-2020",
                    "contact@example.com",
                    "1234567890",
                    "2FA Token Org",
                    "311 Broad Street",
                    "Philadelphia",
                    "PA",
                    "19104",
                    false,
                    "tokentest-valid",
                    TestUtils.hashPassword("tokentest-valid"),
                    UserType.Client);

    User tokenTestExpired =
            new User(
                    "Token",
                    "Test",
                    "06-25-2020",
                    "contact@example.com",
                    "1234567890",
                    "2FA Token Org",
                    "311 Broad Street",
                    "Philadelphia",
                    "PA",
                    "19104",
                    false,
                    "tokentest-expired",
                    TestUtils.hashPassword("tokentest-expired"),
                    UserType.Client);

    // This valid token expires on Jan 1, 2090
    Tokens validToken = new Tokens().setUsername("tokentest-valid").setTwoFactorCode("444555").setTwoFactorExp(new Date(Long.valueOf("3786930000000")));

    // This expired token expired on Jan 1, 1970
    Tokens expiredToken = new Tokens().setUsername("tokentest-expired").setTwoFactorCode("123123").setTwoFactorExp(new Date(Long.valueOf("0")));

    /* *********************** Account Settings Test Users ************************ */

    Organization accountSettingsOrg =
            new Organization(
                    "Account Settings Org",
                    "http://keep.id",
                    "123456789",
                    "311 Broad Street",
                    "Philadelphia",
                    "PA",
                    "19104",
                    "contact@example.com",
                    "1234567890");

    User accountSettingsTest =
            new User(
                    "David",
                    "Smith",
                    "05-23-2002",
                    "contact2@example.com",
                    "412-123-3456",
                    "Account Settings Org",
                    "321 RandomStreet",
                    "RandomCity",
                    "GA",
                    "19091",
                    false,
                    "account-settings-test",
                    TestUtils.hashPassword("account-settings-test"),
                    UserType.Client);

    /* *********************** Password Reset Test Users ************************ */

    // Add the organization documents to the test database.
    MongoCollection<Organization> organizationCollection =
        testDB.getCollection("organization", Organization.class);
    organizationCollection.insertMany(Arrays.asList(broadStreetMinistry, ymca, twoFactorTokenOrg, accountSettingsOrg));

    // Add the user documents to the test database.
    MongoCollection<User> userCollection = testDB.getCollection("user", User.class);
    userCollection.insertMany(
        Arrays.asList(
            adminBSM,
            workerFffBSM,
            workerFftBSM,
            workerTffBSM,
            workerTftBSM,
            workerTtfBSM,
            workerTttBSM,
            adminYMCA,
            workerFffYMCA,
            workerFftYMCA,
            workerTffYMCA,
            workerTftYMCA,
            workerTtfYMCA,
            workerTttYMCA,
            tokenTestValid,
            tokenTestExpired,
            accountSettingsTest));

    // Add the 2FA tokens to the test database
    MongoCollection<Tokens> tokenCollection = testDB.getCollection("tokens", Tokens.class);
    tokenCollection.insertMany(Arrays.asList(validToken, expiredToken));
  }

  // Tears down the test database by clearing all collections.
  public static void tearDownTestDB() {
    MongoConfig.cleanTestDatabase();
  }

  // A private method for hashing passwords.
  private static String hashPassword(String plainPass) {
    Argon2 argon2 = Argon2Factory.create();
    char[] passwordArr = plainPass.toCharArray();
    String passwordHash = null;
    try {
      passwordHash = argon2.hash(10, 65536, 1, passwordArr);
      argon2.wipeArray(passwordArr);
    } catch (Exception e) {
      argon2.wipeArray(passwordArr);
    }
    return passwordHash;
  }

  public static void startServer() {
    MongoClient testClient = MongoConfig.getMongoTestClient();
    MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());
    PdfController pdfController = new PdfController(db);
    UserController userController = new UserController(db);
    AccountSecurityController accountSecurityController = new AccountSecurityController(db);
    app = Javalin.create();
    app.start(serverPort);
    app.post("/login", userController.loginUser);
    app.post("/upload", pdfController.pdfUpload);
    app.post("/download", pdfController.pdfDownload);
    app.post("/delete-document", pdfController.pdfDelete);
    app.post("/get-documents", pdfController.pdfGetAll);
    app.post("/logout", userController.logout);
    app.post("/two-factor", accountSecurityController.twoFactorAuth);
  }

  public static void stopServer() {
    app.stop();
  }

  public static String getServerUrl() {
    return serverUrl;
  }

  public static void login(String username, String password) {
    JSONObject body = new JSONObject();
    body.put("password", password);
    body.put("username", username);
    System.out.println("SERVER URL: " + serverUrl);
    HttpResponse<String> loginResponse =
        Unirest.post(serverUrl + "/login").body(body.toString()).asString();
    JSONObject loginResponseJSON =
        TestUtils.responseStringToJSON(loginResponse.getBody().toString());
    assertThat(loginResponseJSON.getString("status")).isEqualTo("AUTH_SUCCESS");
  }

  public static void logout() {
    HttpResponse<String> logoutResponse = Unirest.post(serverUrl + "/logout").asString();
    JSONObject logoutResponseJSON = TestUtils.responseStringToJSON(logoutResponse.getBody());
    assertThat(logoutResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static JSONObject responseStringToJSON(String response) {
    String strippedResponse = response.substring(1, response.length() - 1).replace("\\", "");
    return new JSONObject(strippedResponse);
  }
}
