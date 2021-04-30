package TestUtils;

import Config.AppConfig;
import Config.DeploymentLevel;
import Config.MongoConfig;
import Organization.Organization;
import Security.EncryptionTools;
import Security.EncryptionUtils;
import Security.GoogleCredentials;
import Security.Tokens;
import User.User;
import User.UserType;
import com.google.crypto.tink.Aead;
import com.google.crypto.tink.JsonKeysetReader;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.Javalin;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDNonTerminalField;
import org.bson.Document;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

public class TestUtils {
  private static final int SERVER_TEST_PORT = Integer.parseInt(System.getenv("TEST_PORT"));
  private static final String SERVER_TEST_URL = "http://localhost:" + SERVER_TEST_PORT;
  private static Javalin app;
  private static EncryptionUtils encryptionUtils;
  private static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));
  private static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public static void startServer() {
    if (app == null) {
      try {
        MongoConfig.getMongoClient();
        MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);
        try {
          EncryptionTools encryptionTools = new EncryptionTools(db);
          encryptionTools.generateAndUploadKeySet();
        } catch (Exception e) {

        }
        EncryptionUtils.initialize();
        encryptionUtils = EncryptionUtils.getInstance();
      } catch (Exception e) {
        System.err.println(e.getStackTrace());
        System.exit(0);
      }
      app = AppConfig.appFactory(DeploymentLevel.TEST);
    }
  }

  public static String getServerUrl() {
    return SERVER_TEST_URL;
  }
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
  public static void setUpTestDB() {
    // If there are entries in the database, they should be cleared before more are added.
    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);

    try {
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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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
              UserType.Worker);

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

      User tokenTestNoToken =
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
              "tokentest-notoken",
              TestUtils.hashPassword("tokentest-notoken"),
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
      Tokens validToken =
          new Tokens()
              .setUsername("tokentest-valid")
              .setTwoFactorCode("444555")
              .setTwoFactorExp(new Date(Long.valueOf("3786930000000")));

      // This expired token expired on Jan 1, 1970
      Tokens expiredToken =
          new Tokens()
              .setUsername("tokentest-expired")
              .setTwoFactorCode("123123")
              .setTwoFactorExp(new Date(Long.valueOf("0")));

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

      User settingsTest2FA =
          new User(
              "Settings-Test",
              "TwoFactor",
              "06-25-2020",
              "contact@example.com",
              "1234567890",
              "Account Settings Org",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "settings-test-2fa",
              TestUtils.hashPassword("settings-test-2fa"),
              UserType.Client);

      /* *********************** Password Reset Test Users ************************ */

      Organization passwordSettingsOrg =
          new Organization(
              "Password Settings Org",
              "http://keep.id",
              "123456789",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              "contact@example.com",
              "1234567890");

      User passwordResetTest =
          new User(
              "Password",
              "Reset",
              "06-25-2020",
              "contact@example.com",
              "1234567890",
              "Password Settings Org",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "password-reset-test",
              TestUtils.hashPassword("a4d3jgHow0"),
              UserType.Client);

      /* *********************** Login History Test Users ************************ */
      User logInHistoryTest =
          new User(
              "Cathy",
              "Chen",
              "07-14-2020",
              "contact@example.com",
              "1234567890",
              "login history Org",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "login-history-test",
              TestUtils.hashPassword("login-history-test"),
              UserType.Client);
      /* *********************** Activity Test Users ************************ */
      User createAdminOwner =
          new User(
              "Cathy",
              "Chen",
              "07-14-2020",
              "contact@example.com",
              "1234567890",
              "login history Org",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "createAdminOwner",
              TestUtils.hashPassword("login-history-test"),
              UserType.Director);

      User createdAdmin =
          new User(
              "Cathy",
              "Chen",
              "07-14-2020",
              "contact@example.com",
              "1234567890",
              "login history Org",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "createdAdmin",
              TestUtils.hashPassword("login-history-test"),
              UserType.Admin);

      // Add the organization documents to the test database.
      MongoCollection<Organization> organizationCollection =
          testDB.getCollection("organization", Organization.class);
      organizationCollection.insertMany(
          Arrays.asList(
              broadStreetMinistry,
              ymca,
              twoFactorTokenOrg,
              accountSettingsOrg,
              passwordSettingsOrg));

      // Add the user documents to the test database.
      List<User> users =
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
              tokenTestNoToken,
              tokenTestExpired,
              accountSettingsTest,
              settingsTest2FA,
              passwordResetTest,
              logInHistoryTest);
      // Need to encrypt users before upload
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
              client1YMCA,
              client2YMCA,
              client1BSM,
              client2BSM,
              tokenTestValid,
              tokenTestNoToken,
              tokenTestExpired,
              accountSettingsTest,
              settingsTest2FA,
              passwordResetTest,
              logInHistoryTest,
              createAdminOwner,
              createdAdmin));

      // Add the 2FA tokens to the test database
      MongoCollection<Tokens> tokenCollection = testDB.getCollection("tokens", Tokens.class);
      tokenCollection.insertMany(Arrays.asList(validToken, expiredToken));

      // Add an AED to the test database
      MongoCollection<Document> keysCollection = testDB.getCollection("keys", Document.class);
      Document aed = new Document();
      aed.append("primaryKeyId", 1234567890);
      keysCollection.insertOne(aed);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static EncryptionUtils getEncryptionUtils() {
    return encryptionUtils;
  }

  // Tears down the test database by clearing all collections.
  public static void tearDownTestDB() {
    MongoConfig.dropDatabase(DeploymentLevel.TEST);
  }

  // A private method for hashing passwords.
  public static String hashPassword(String plainPass) {
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

  public static Aead getAead() throws GeneralSecurityException, IOException {
    MongoConfig.getMongoClient();
    MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);
    assert db != null;
    MongoCollection<Document> keyCollection = db.getCollection("keys", Document.class);
    Document handleDoc = keyCollection.find(Filters.eq("keyType", "encryption")).first();

    handleDoc.remove("fieldname");
    KeysetHandle keysetHandle =
        KeysetHandle.read(
            JsonKeysetReader.withJsonObject(new JSONObject(handleDoc)),
            new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));
    GoogleCredentials.deleteCredentials();
    return keysetHandle.getPrimitive(Aead.class);
  }

  public static void login(String username, String password) {
    JSONObject body = new JSONObject();
    body.put("password", password);
    body.put("username", username);
    HttpResponse<String> loginResponse =
        Unirest.post(SERVER_TEST_URL + "/login").body(body.toString()).asString();
    JSONObject loginResponseJSON = TestUtils.responseStringToJSON(loginResponse.getBody());
    assertThat(loginResponseJSON.getString("status")).isEqualTo("AUTH_SUCCESS");
  }

  public static void logout() {
    HttpResponse<String> logoutResponse = Unirest.get(SERVER_TEST_URL + "/logout").asString();
    JSONObject logoutResponseJSON = TestUtils.responseStringToJSON(logoutResponse.getBody());
    assertThat(logoutResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static void uploadFile(String username, String password, String filename) {
    login(username, password);
    String filePath =
        Paths.get("").toAbsolutePath().toString()
            + File.separator
            + "src"
            + File.separator
            + "test"
            + File.separator
            + "resources"
            + File.separator
            + filename;

    File file = new File(filePath);
    HttpResponse<String> uploadResponse =
        Unirest.post(getServerUrl() + "/upload")
            .field("pdfType", "FORM")
            .header("Content-Disposition", "attachment")
            .field("file", file)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");
    logout();
  }

  public static JSONObject responseStringToJSON(String response) {
    if (response.charAt(0) == '"') {
      String strippedResponse = response.substring(1, response.length() - 1).replace("\\", "");
      return new JSONObject(strippedResponse);
    }
    return new JSONObject(response);
  }

  public static JSONObject getFieldValues(InputStream inputStream) throws IOException {
    PDDocument pdfDocument = PDDocument.load(inputStream);
    JSONObject fieldValues = new JSONObject();
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    List<PDField> fields = new LinkedList<>();
    fields.addAll(acroForm.getFields());
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        fieldValues.put(field.getFullyQualifiedName(), field.getValueAsString());
      }

      // Delete field just gotten so we do not infinite recurse
      fields.remove(0);
    }
    pdfDocument.close();
    return fieldValues;
  }

  public static Set<String> validFieldTypes =
      new HashSet<>(
          Arrays.asList(
              "CheckBox",
              "PushButton",
              "RadioButton",
              "ComboBox",
              "ListBox",
              "TextField",
              "SignatureField"));
}
