package ProductionAPITest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.SecurityUtils;
import TestUtils.TestUtils;
import User.User;
import User.UserType;
import Organization.Organization;
import Validation.ValidationException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.bson.types.ObjectId;
import org.json.JSONObject;
import org.junit.*;

import java.util.ArrayList;
import java.util.Iterator;

import static com.mongodb.client.model.Filters.eq;
import static org.assertj.core.api.Assertions.assertThat;

public class ProductionControllerIntegrationTests {

  static String YMCAOrganizationId = "";

  @BeforeClass
  public static void setUp() throws ValidationException {
    TestUtils.startServer();
    TestUtils.setUpTestDB();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    var YMCAOrg = dbOrganizations.find(eq("orgName", "YMCA")).first();
    assert YMCAOrg != null;
    YMCAOrganizationId = YMCAOrg.getId().toHexString();

    var developerUser = new User(
        "Test",
        "Developer",
        "06-16-1960",
        "developer@keep.id",
        "1234567890",
        "YMCA",
        "234 Main St",
        "Philadelphia",
        "PA",
        "19104",
        false,
        "devYMCA",
        TestUtils.hashPassword("devYMCA123"),
        UserType.Developer);
    MongoCollection<User> userCollection = testDB.getCollection("user", User.class);
    userCollection.insertOne(developerUser);
  }

  @Before
  public void login() {
    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    MongoCollection<User> userCollection = testDB.getCollection("user", User.class);
    TestUtils.login("devYMCA", "devYMCA123");
  }

  @After
  public void logout() {
    TestUtils.logout();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  @Test
  public void createUser() {
    JSONObject postBody = new JSONObject();
    postBody.put("firstName", "Test");
    postBody.put("lastName", "User");
    postBody.put("birthDate", "01-01-2000");
    postBody.put("email", "test@example.com");
    postBody.put("phone", "15555555555");
    postBody.put("address", "123 Main Street");
    postBody.put("city", "Chicago");
    postBody.put("state", "IL");
    postBody.put("zipcode", "60603");
    postBody.put("organization", "YMCA");
    postBody.put("username", "test_username");
    postBody.put("password", "p@$$w0rd");
    postBody.put("privilegeLevel", "Client");

    HttpResponse<User> createUserResponse = Unirest.post(TestUtils.getServerUrl() + "/users")
        .body(postBody.toString())
        .asObject(User.class);

    var createdUser = createUserResponse.getBody().toMap();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    var dbUser = dbUsers.find(eq("username", postBody.get("username"))).first().toMap();

    for (Iterator<String> it = postBody.keys(); it.hasNext(); ) {
      String key = it.next();

      if (key.equals("password")) {
        assertThat(createdUser.get(key)).isEqualTo(null);
        assertThat(SecurityUtils.verifyPassword(postBody.getString("password"), dbUser.get(key).toString())).isEqualTo(SecurityUtils.PassHashEnum.SUCCESS);
      } else {
        assertThat(createdUser.get(key)).isEqualTo(postBody.getString(key));
        assertThat(dbUser.get(key)).isEqualTo(postBody.getString(key));
      }
    }
  }

  @Test
  public void createUserWithInvalidProperties() {
    JSONObject postBody = new JSONObject();
    postBody.put("firstName", "Test");
    postBody.put("lastName", "User");
    postBody.put("birthDate", "01-01-2000");
    postBody.put("email", "test@example.com");
    postBody.put("phone", "15555555555");
    postBody.put("address", "123 Main Street");
    postBody.put("city", "Chicago");
    postBody.put("state", "IL");
    postBody.put("zipcode", "60603");
    postBody.put("organization", "YMCA");
    postBody.put("username", "test_username_invalid_properties");
    postBody.put("password", "p@$$w0rd");
    postBody.put("privilegeLevel", "Client");
    postBody.put("INVALID_PROPERTY", "test value");
    var createUserResponse = Unirest.post(TestUtils.getServerUrl() + "/users")
        .body(postBody.toString())
        .asString();

    assertThat(createUserResponse.getStatus()).isEqualTo(400);
    assertThat(createUserResponse.getBody()).contains("Couldn't deserialize body to User");

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    assertThat(dbUsers.countDocuments(eq("username", postBody.get("username")))).isEqualTo(0);
  }

  @Test
  public void createUserWithNonexistentOrganization() {
    JSONObject postBody = new JSONObject();
    postBody.put("firstName", "Test");
    postBody.put("lastName", "User");
    postBody.put("birthDate", "01-01-2000");
    postBody.put("email", "test@example.com");
    postBody.put("phone", "15555555555");
    postBody.put("address", "123 Main Street");
    postBody.put("city", "Chicago");
    postBody.put("state", "IL");
    postBody.put("zipcode", "60603");
    postBody.put("organization", "org-that-does-not-exist");
    postBody.put("username", "test_username_invalid_properties");
    postBody.put("password", "p@$$w0rd");
    postBody.put("privilegeLevel", "Client");
    var createUserResponse = Unirest.post(TestUtils.getServerUrl() + "/users")
        .body(postBody.toString())
        .asString();

    assertThat(createUserResponse.getStatus()).isEqualTo(400);
    assertThat(createUserResponse.getBody()).contains("Specified Organization does not exist");

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    assertThat(dbUsers.countDocuments(eq("username", postBody.get("username")))).isEqualTo(0);
  }

  @Test
  public void createUserWithPreexistingUsername() {
    JSONObject postBody = new JSONObject();
    postBody.put("firstName", "Test");
    postBody.put("lastName", "User");
    postBody.put("birthDate", "01-01-2000");
    postBody.put("email", "test@example.com");
    postBody.put("phone", "15555555555");
    postBody.put("address", "123 Main Street");
    postBody.put("city", "Chicago");
    postBody.put("state", "IL");
    postBody.put("zipcode", "60603");
    postBody.put("organization", "YMCA");
    postBody.put("username", "adminYMCA");
    postBody.put("password", "p@$$w0rd");
    postBody.put("privilegeLevel", "Client");
    var createUserResponse = Unirest.post(TestUtils.getServerUrl() + "/users")
        .body(postBody.toString())
        .asString();

    assertThat(createUserResponse.getStatus()).isEqualTo(409);
    assertThat(createUserResponse.getBody()).contains("User with username '" + postBody.getString("username") + "' already exists");

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    assertThat(dbUsers.countDocuments(eq("username", postBody.get("username")))).isEqualTo(1);
  }

  @Test
  public void listUsers() {
    HttpResponse<ArrayList> listUsersResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users")
            .asObject(new ArrayList<User>().getClass());

    ArrayList<User> users = listUsersResponse.getBody();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);

    assertThat(users.size()).isEqualTo(dbUsers.countDocuments());
  }

  @Test
  public void getUser() {
    var username = "adminYMCA";
    HttpResponse<User> getUserResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    var user = getUserResponse.getBody();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    var dbUser = dbUsers.find(eq("username", username)).first();

    assertThat(user.serialize().toMap()).isEqualTo(dbUser.serialize().toMap());
  }

  @Test
  public void getUserThatDoesNotExist() {
    var username = "user-that-does-not-exist";
    HttpResponse<User> getUserResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    assertThat(getUserResponse.getStatus()).isEqualTo(404);
  }

  @Test
  public void deleteUser() {
    var username = "adminYMCA";
    HttpResponse<User> getUserResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    var user = getUserResponse.getBody();
    assertThat(user.getUsername()).isEqualTo(username);

    var deleteUserResponse = Unirest.delete(TestUtils.getServerUrl() + "/users/" + username)
        .asObject(User.class);

    assertThat(deleteUserResponse.getStatus()).isEqualTo(204);

    HttpResponse<User> getUserResponseAfterDelete =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);
    assertThat(getUserResponseAfterDelete.getStatus()).isEqualTo(404);

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("user", User.class);
    assertThat(dbUsers.countDocuments(eq("username", username))).isEqualTo(0);
  }

  @Test
  public void deleteUserThatDoesNotExist() {
    var username = "user-that-does-not-exist";
    HttpResponse<User> deleteUserResponse =
        Unirest.delete(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    assertThat(deleteUserResponse.getStatus()).isEqualTo(404);
  }

  @Test
  public void updateUser() {
    var username = "adminYMCA";
    HttpResponse<User> actualResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    var initialUser = actualResponse.getBody();

    JSONObject updateBody = new JSONObject();
    updateBody.put("firstName", "newFirstName");
    updateBody.put("email", "new-email@example.com");
    HttpResponse<User> updateResponse =
        Unirest.patch(TestUtils.getServerUrl() + "/users/" + username)
            .body(updateBody.toString())
            .asObject(User.class);

    assertThat(updateResponse.getBody().getFirstName()).isEqualTo(updateBody.get("firstName"));
    assertThat(updateResponse.getBody().getEmail()).isEqualTo(updateBody.get("email"));

    HttpResponse<User> getUserAfterUpdateResponse =
        Unirest.get(TestUtils.getServerUrl() + "/users/" + username)
            .asObject(User.class);

    assertThat(getUserAfterUpdateResponse.getBody().getFirstName()).isEqualTo(updateBody.get("firstName"));
    assertThat(getUserAfterUpdateResponse.getBody().getEmail()).isEqualTo(updateBody.get("email"));
    assertThat(getUserAfterUpdateResponse.getBody().serialize().toMap()).isEqualTo(updateResponse.getBody().serialize().toMap());
    assertThat(getUserAfterUpdateResponse.getBody().getCreationDate()).isEqualTo(initialUser.getCreationDate());
  }

  @Test
  public void updateUserWithInvalidProperties() {
    var username = "adminYMCA";
    JSONObject updateBody = new JSONObject();
    updateBody.put("firstName", "newFirstName");
    updateBody.put("email", "new-email@example.com");
    updateBody.put("INVALID_PROPERTY", "test value");
    var updateResponse =
        Unirest.patch(TestUtils.getServerUrl() + "/users/" + username)
            .body(updateBody.toString())
            .asString();

    assertThat(updateResponse.getStatus()).isEqualTo(400);
    assertThat(updateResponse.getBody()).contains("Couldn't deserialize body to UserUpdateRequest");
  }

  @Test
  public void requestsWithUnauthorizedSession() {

  }

  @Test
  public void createOrganization() {
    JSONObject postBody = new JSONObject();
    postBody.put("orgName", "ProductionController Test Org");
    postBody.put("orgWebsite", "https://www.example.com");
    postBody.put("orgEIN", "12-1234567");
    postBody.put("orgEmail", "test@example.com");
    postBody.put("orgPhoneNumber", "15555555555");
    postBody.put("orgStreetAddress", "123 Main Street");
    postBody.put("orgCity", "Chicago");
    postBody.put("orgState", "IL");
    postBody.put("orgZipcode", "60607");

    HttpResponse<Organization> createOrganizationResponse = Unirest.post(TestUtils.getServerUrl() + "/organizations")
        .body(postBody.toString())
        .asObject(Organization.class);

    assertThat(createOrganizationResponse.getStatus()).isEqualTo(201);
    var createdOrganization = createOrganizationResponse.getBody().serialize().toMap();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    var dbOrganization = dbOrganizations.find(eq("orgName", postBody.get("orgName"))).first().serialize().toMap();

    for (Iterator<String> it = postBody.keys(); it.hasNext(); ) {
      String key = it.next();

      assertThat(createdOrganization.get(key)).isEqualTo(postBody.getString(key));
      assertThat(dbOrganization.get(key)).isEqualTo(postBody.getString(key));
    }
  }

  @Test
  public void createOrganizationWithInvalidProperties() {
    JSONObject postBody = new JSONObject();
    postBody.put("orgName", "ProductionController Test Org Invalid Properties");
    postBody.put("orgWebsite", "https://www.example.com");
    postBody.put("orgEIN", "12-1234567");
    postBody.put("orgEmail", "test@example.com");
    postBody.put("orgPhoneNumber", "15555555555");
    postBody.put("orgStreetAddress", "123 Main Street");
    postBody.put("orgCity", "Chicago");
    postBody.put("orgState", "IL");
    postBody.put("orgZipcode", "60607");
    postBody.put("INVALID_PROPERTY", "test value");
    var createOrganizationResponse = Unirest.post(TestUtils.getServerUrl() + "/organizations")
        .body(postBody.toString())
        .asString();

    assertThat(createOrganizationResponse.getStatus()).isEqualTo(400);
    assertThat(createOrganizationResponse.getBody()).contains("Couldn't deserialize body to Organization");

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    assertThat(dbOrganizations.countDocuments(eq("orgName", postBody.get("orgName")))).isEqualTo(0);
  }

  @Test
  public void createOrganizationWithPreexistingName() {
    JSONObject postBody = new JSONObject();
    postBody.put("orgName", "YMCA");
    postBody.put("orgWebsite", "https://www.example.com");
    postBody.put("orgEIN", "12-1234567");
    postBody.put("orgEmail", "test@example.com");
    postBody.put("orgPhoneNumber", "15555555555");
    postBody.put("orgStreetAddress", "123 Main Street");
    postBody.put("orgCity", "Chicago");
    postBody.put("orgState", "IL");
    postBody.put("orgZipcode", "60607");
    var createOrganizationResponse = Unirest.post(TestUtils.getServerUrl() + "/organizations")
        .body(postBody.toString())
        .asString();

    assertThat(createOrganizationResponse.getStatus()).isEqualTo(409);
    assertThat(createOrganizationResponse.getBody()).contains("Organization with orgName '" + postBody.getString("orgName") + "' already exists");

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    assertThat(dbOrganizations.countDocuments(eq("orgName", postBody.get("orgName")))).isEqualTo(1);
  }

  @Test
  public void listOrganizations() {
    HttpResponse<ArrayList> listOrganizationsResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations")
            .asObject(new ArrayList<Organization>().getClass());

    assertThat(listOrganizationsResponse.getStatus()).isEqualTo(200);
    ArrayList<Organization> organizations = listOrganizationsResponse.getBody();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);

    assertThat(organizations.size()).isEqualTo(dbOrganizations.countDocuments());
  }

  @Test
  public void getOrganization() {
    var orgId = YMCAOrganizationId;
    HttpResponse<Organization> getOrganizationResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .asObject(Organization.class);

    assertThat(getOrganizationResponse.getStatus()).isEqualTo(200);
    Organization organization = getOrganizationResponse.getBody();

    assert organization != null;

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    var dbOrganization = dbOrganizations.find(eq("orgName", "YMCA")).first();

    assert dbOrganization != null;
    assertThat(organization.getOrgName()).isEqualTo(dbOrganization.getOrgName());
    assertThat(organization.getOrgEmail()).isEqualTo(dbOrganization.getOrgEmail());
    assertThat(organization.serialize().toMap()).isEqualTo(dbOrganization.serialize().toMap());
  }

  @Test
  public void getOrganizationThatDoesNotExist() {
    var id = new ObjectId().toHexString();
    HttpResponse<Organization> getOrganizationResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + id)
            .asObject(Organization.class);

    assertThat(getOrganizationResponse.getStatus()).isEqualTo(404);
  }

  @Test
  public void deleteOrganization() {
    JSONObject postBody = new JSONObject();
    postBody.put("orgName", "ProductionController Test Org to Delete");
    postBody.put("orgWebsite", "https://www.example.com");
    postBody.put("orgEIN", "12-1234567");
    postBody.put("orgEmail", "test@example.com");
    postBody.put("orgPhoneNumber", "15555555555");
    postBody.put("orgStreetAddress", "123 Main Street");
    postBody.put("orgCity", "Chicago");
    postBody.put("orgState", "IL");
    postBody.put("orgZipcode", "60607");

    HttpResponse<Organization> createOrganizationResponse = Unirest.post(TestUtils.getServerUrl() + "/organizations")
        .body(postBody.toString())
        .asObject(Organization.class);

    assertThat(createOrganizationResponse.getStatus()).isEqualTo(201);

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbOrganization = testDB.getCollection("organization", Organization.class).find(eq("orgName", postBody.get("orgName"))).first();
    String orgId = dbOrganization.getId().toHexString();

    HttpResponse<Organization> getOrganizationResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .asObject(Organization.class);

    var organization = getOrganizationResponse.getBody();
    assertThat(organization.getOrgName()).isEqualTo(postBody.getString("orgName"));

    var deleteOrganizationResponse = Unirest.delete(TestUtils.getServerUrl() + "/organizations/" + orgId)
        .asObject(Organization.class);

    assertThat(deleteOrganizationResponse.getStatus()).isEqualTo(204);

    HttpResponse<Organization> getOrganizationResponseAfterDelete =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .asObject(Organization.class);
    assertThat(getOrganizationResponseAfterDelete.getStatus()).isEqualTo(404);

    var dbOrganizations = testDB.getCollection("organization", Organization.class);
    assertThat(dbOrganizations.countDocuments(eq("orgName", postBody.getString("orgName")))).isEqualTo(0);
  }

  @Test
  public void deleteOrganizationThatDoesNotExist() {
    var id = new ObjectId().toHexString();
    HttpResponse<Organization> deleteOrganizationResponse =
        Unirest.delete(TestUtils.getServerUrl() + "/organizations/" + id)
            .asObject(Organization.class);

    assertThat(deleteOrganizationResponse.getStatus()).isEqualTo(404);
  }

  @Test
  public void updateOrganization() {
    var orgId = YMCAOrganizationId;
    HttpResponse<Organization> initialResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .asObject(Organization.class);

    assertThat(initialResponse.getStatus()).isEqualTo(200);
    var initialOrganization = initialResponse.getBody();

    JSONObject updateBody = new JSONObject();
    updateBody.put("orgEmail", "new-email@example.com");
    HttpResponse<Organization> updateResponse =
        Unirest.patch(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .body(updateBody.toString())
            .asObject(Organization.class);

    assertThat(updateResponse.getStatus()).isEqualTo(200);
    assertThat(updateResponse.getBody().getOrgEmail()).isEqualTo(updateBody.get("orgEmail"));

    HttpResponse<Organization> getOrganizationAfterUpdateResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .asObject(Organization.class);

    assertThat(getOrganizationAfterUpdateResponse.getBody().getOrgEmail()).isEqualTo(updateBody.get("orgEmail"));
    assertThat(getOrganizationAfterUpdateResponse.getBody().serialize().toMap()).isEqualTo(updateResponse.getBody().serialize().toMap());
    assertThat(getOrganizationAfterUpdateResponse.getBody().getCreationDate()).isEqualTo(initialOrganization.getCreationDate());
  }

  @Test
  public void updateOrganizationWithInvalidProperties() {
    var orgId = YMCAOrganizationId;
    JSONObject updateBody = new JSONObject();
    updateBody.put("orgEmail", "new-email@example.com");
    updateBody.put("INVALID_PROPERTY", "test value");
    var updateResponse =
        Unirest.patch(TestUtils.getServerUrl() + "/organizations/" + orgId)
            .body(updateBody.toString())
            .asString();

    assertThat(updateResponse.getStatus()).isEqualTo(400);
    assertThat(updateResponse.getBody()).contains("Couldn't deserialize body to OrganizationUpdateRequest");
  }

  @Test
  public void getOrganizationMembers() {
    var orgId = YMCAOrganizationId;
    HttpResponse<ArrayList> getMembersResponse =
        Unirest.get(TestUtils.getServerUrl() + "/organizations/" + orgId + "/users")
            .asObject(new ArrayList<User>().getClass());

    assertThat(getMembersResponse.getStatus()).isEqualTo(200);
    ArrayList<User> members = getMembersResponse.getBody();

    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    var dbUsers = testDB.getCollection("users", User.class);
    var dbMembers = dbUsers.find(eq("organization", "YMCA"));
    var dbMembersCount = dbUsers.countDocuments(eq("organization", "YMCA"));

    assertThat(members.size()).isEqualTo(dbMembersCount);
    members.forEach(m -> {
      var correspondingDbMember = dbMembers.filter(eq("username", m.getUsername())).first();
      assert correspondingDbMember != null;
      assertThat(m.serialize().toMap()).isEqualTo(correspondingDbMember.serialize().toMap());
    });
  }

  @Test
  public void endpointsShouldOnlyBeAvailableToAuthenticatedDevelopers() {
    TestUtils.logout();
    ArrayList<String>  getEndpoints = new ArrayList<String>();
    getEndpoints.add("/users");
    getEndpoints.add("/users/adminYMCA");
    getEndpoints.add("/organizations");
    getEndpoints.add("/organizations/" + YMCAOrganizationId);
    getEndpoints.add("/organizations/" + YMCAOrganizationId + "/users");

    for (String endpoint : getEndpoints) {
      HttpResponse<String> response = Unirest.get(TestUtils.getServerUrl() + endpoint).asString();
      assertThat(response.getStatus()).isEqualTo(401);
    }

    TestUtils.login("adminYMCA", "adminYMCA");
    for (String endpoint : getEndpoints) {
      HttpResponse<String> response = Unirest.get(TestUtils.getServerUrl() + endpoint).asString();
      assertThat(response.getStatus()).isEqualTo(403);
    }
  }
}
