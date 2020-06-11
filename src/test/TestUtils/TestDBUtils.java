package TestUtils;

import Config.MongoConfig;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import org.bson.Document;

import java.util.Arrays;

public class TestDBUtils {
  private static MongoDatabase testDB =
      MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());

  /* Load the test database with:
   * Admins of Broad Street Ministry and YMCA
   * Workers with all sets of permissions, labelled with flags denoting their permission level, i.e. 001 denotes
   * permission levels set to false, false, true for canView, canEdit, canRegister.
   * 2 clients each.
   *
   * Passwords are the same as usernames.
   */
  public static void setUpTestDB() {
    // If there are entries in the database, they should be cleared before more are added.
    TestDBUtils.tearDownTestDB();
    MongoConfig.getMongoTestClient();

    /* *********************** Broad Street Ministry ************************ */
    Document broadStreetMinistry =
        new Document("orgName", "Broad Street Ministry")
            .append("website", "http://www.broadstreetministry.org")
            .append("ein", "123456")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("email", "mikedahl@broadstreetministry.org")
            .append("phone", "1234567890");

    Document adminBSM =
        new Document("username", "adminBSM")
            .append("password", TestDBUtils.hashPassword("adminBSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "mikedahl@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Mike")
            .append("lastName", "Dahl")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "admin")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", true);

    Document worker000BSM =
        new Document("username", "worker000BSM")
            .append("password", TestDBUtils.hashPassword("worker000BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker000BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "000")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    Document worker001BSM =
        new Document("username", "worker001BSM")
            .append("password", TestDBUtils.hashPassword("worker001BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker001BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "001")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", true);

    Document worker100BSM =
        new Document("username", "worker100BSM")
            .append("password", TestDBUtils.hashPassword("worker100BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker100BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "100")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", false)
            .append("canRegister", false);

    Document worker101BSM =
        new Document("username", "worker101BSM")
            .append("password", TestDBUtils.hashPassword("worker101BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker101BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "101")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", false)
            .append("canRegister", true);

    Document worker110BSM =
        new Document("username", "worker110BSM")
            .append("password", TestDBUtils.hashPassword("worker110BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker110BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "110")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", false);

    Document worker111BSM =
        new Document("username", "worker111BSM")
            .append("password", TestDBUtils.hashPassword("worker111BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "worker111BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Worker")
            .append("lastName", "111")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", true);

    Document client1BSM =
        new Document("username", "client1BSM")
            .append("password", TestDBUtils.hashPassword("client1BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "client1BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Client")
            .append("lastName", "1")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "client")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    Document client2BSM =
        new Document("username", "client2BSM")
            .append("password", TestDBUtils.hashPassword("client2BSM"))
            .append("organization", "Broad Street Ministry")
            .append("email", "client2BSM@broadstreetministry.org")
            .append("phone", "2157354847")
            .append("firstName", "Client")
            .append("lastName", "2")
            .append("address", "315 S Broad Street")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19107")
            .append("privilegeLevel", "client")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    /** ******************** YMCA **************************** */
    Document ymca =
        new Document("orgName", "YMCA")
            .append("website", "http://www.ymca.net")
            .append("ein", "123456")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("email", "info@ymca.net")
            .append("phone", "1234567890");

    Document adminYMCA =
        new Document("username", "adminYMCA")
            .append("password", TestDBUtils.hashPassword("adminYMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "admin")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", true);

    Document worker000YMCA =
        new Document("username", "worker000YMCA")
            .append("password", TestDBUtils.hashPassword("worker000YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    Document worker001YMCA =
        new Document("username", "worker001YMCA")
            .append("password", TestDBUtils.hashPassword("worker001YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", true);

    Document worker100YMCA =
        new Document("username", "worker100YMCA")
            .append("password", TestDBUtils.hashPassword("worker100YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", false)
            .append("canRegister", false);

    Document worker101YMCA =
        new Document("username", "worker101YMCA")
            .append("password", TestDBUtils.hashPassword("worker101YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", false)
            .append("canRegister", true);

    Document worker110YMCA =
        new Document("username", "worker110YMCA")
            .append("password", TestDBUtils.hashPassword("worker110YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", false);

    Document worker111YMCA =
        new Document("username", "worker111YMCA")
            .append("password", TestDBUtils.hashPassword("worker111YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "worker")
            .append("canView", true)
            .append("canEdit", true)
            .append("canRegister", true);

    Document client1YMCA =
        new Document("username", "client1YMCA")
            .append("password", TestDBUtils.hashPassword("client1YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "client")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    Document client2YMCA =
        new Document("username", "client1YMCA")
            .append("password", TestDBUtils.hashPassword("client2YMCA"))
            .append("organization", "YMCA")
            .append("email", "info@ymca.net")
            .append("phone", "2157354847")
            .append("firstName", "YM")
            .append("lastName", "CA")
            .append("address", "11088 Knights Rd")
            .append("city", "Philadelphia")
            .append("state", "PA")
            .append("zipcode", "19154")
            .append("privilegeLevel", "client")
            .append("canView", false)
            .append("canEdit", false)
            .append("canRegister", false);

    // Add the organization documents to the test database.
    MongoCollection<Document> organizationCollection = testDB.getCollection("organization");
    organizationCollection.insertMany(Arrays.asList(broadStreetMinistry, ymca));

    // Add the user documents to the test database.
    MongoCollection<Document> userCollection = testDB.getCollection("user");
    userCollection.insertMany(
        Arrays.asList(
            adminBSM,
            worker000BSM,
            worker001BSM,
            worker100BSM,
            worker101BSM,
            worker110BSM,
            worker111BSM,
            adminYMCA,
            worker000YMCA,
            worker001YMCA,
            worker100YMCA,
            worker101YMCA,
            worker110YMCA,
            worker111YMCA));
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
}
