package TestUtils;

import Config.MongoConfig;
import Organization.Organization;
import User.User;
import User.UserType;
import Validation.ValidationException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.regex.Pattern;

public class TestUtils {
  private static MongoDatabase testDB =
      MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());

  /* Load the test database with:
   * Admins of Broad Street Ministry and YMCA
   * Workers with all sets of permissions, labelled with flags denoting their permission level, i.e. fft denotes
   * permission levels set to false, false, true for canView, canEdit, canRegister.
   * 2 clients each.
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
            "06/16/1960",
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
                "12/14/1997",
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
                "09/04/1978",
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
                "09/04/1978",
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
                "09/14/1978",
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
                "09/14/1978",
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
                "09/14/1978",
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
            "09/14/1978",
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
            "09/14/1997",
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

    /** ******************** YMCA **************************** */
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
            "06/16/1960",
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
                "12/14/1997",
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
                "09/04/1978",
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
                "09/04/1978",
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
                "09/14/1978",
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
                "09/14/1978",
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
                "09/14/1978",
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
            "09/14/1978",
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
            "09/14/1997",
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

    // Add the organization documents to the test database.
    MongoCollection<Organization> organizationCollection =
        testDB.getCollection("organization", Organization.class);
    organizationCollection.insertMany(Arrays.asList(broadStreetMinistry, ymca));

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
            workerTttYMCA));
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

  public static JSONObject responseStringToJSON(String response) {
    JSONObject json = new JSONObject();

    String strippedResponse = response.substring(4);
    strippedResponse = strippedResponse.substring(0, strippedResponse.length() - 4);

    String[] responseArr = strippedResponse.split(Pattern.quote("\\\",\\\""));

    for (int i = 0; i < responseArr.length; i++) {
      String[] keyValPair = responseArr[i].split(Pattern.quote("\\\":\\\""));

      String key = keyValPair[0];
      String val = "";
      if (keyValPair.length == 2) val = keyValPair[1];

      json.put(key, val);
    }

    return json;
  }
}
