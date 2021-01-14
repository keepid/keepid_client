package UserTest;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class UserControllerIntegrationTest {

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  @Test
  public void loginUserWithNoUsernameTest() {
    JSONObject body = new JSONObject();
    body.put("password", "pass");
    body.put("username", "");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/login")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("firstName"));
    assertThat(actualResponseJSON.getString("firstName")).isEqualTo("");
    assert (actualResponseJSON.has("lastName"));
    assertThat(actualResponseJSON.getString("lastName")).isEqualTo("");
    assert (actualResponseJSON.has("organization"));
    assertThat(actualResponseJSON.getString("organization")).isEqualTo("");
    assert (actualResponseJSON.has("userRole"));
    assertThat(actualResponseJSON.getString("userRole")).isEqualTo("");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }

  @Test
  public void testUserEncryption() {
    TestUtils.login("adminBSM", "adminBSM");
    JSONObject body = new JSONObject();
    body.put("username", "adminBSM");

    HttpResponse<String> actualResponse =
        Unirest.get(TestUtils.getServerUrl() + "/get-user-info").asString();
    JSONObject actualResponseJson = TestUtils.responseStringToJSON(actualResponse.getBody());
    assertThat(actualResponseJson.get("city").toString()).isEqualTo("Philadelphia");
    assertThat(actualResponseJson.get("firstName").toString()).isEqualTo("Mike");
    assertThat(actualResponseJson.get("lastName").toString()).isEqualTo("Dahl");
    assertThat(actualResponseJson.get("zipcode").toString()).isEqualTo("19104");
    assertThat(actualResponseJson.get("phone").toString()).isEqualTo("1234567890");
    assertThat(actualResponseJson.get("address").toString()).isEqualTo("311 Broad Street");
    assertThat(actualResponseJson.get("birthDate").toString()).isEqualTo("06-16-1960");
    assertThat(actualResponseJson.get("email").toString())
        .isEqualTo("mikedahl@broadstreetministry.org");
  }

  @Test
  public void testGetMembersEncryption() {
    TestUtils.login("adminBSM", "adminBSM");
    JSONObject body = new JSONObject();
    body.put("name", "Mike Dahl");
    body.put("listType", "clients");
    body.put("currentPage", "1");
    body.put("itemsPerPage", "10");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-organization-members")
            .body(body.toString())
            .asString();
    JSONObject actualResponseJson = TestUtils.responseStringToJSON(actualResponse.getBody());
  }

  @Test
  public void createUserWithNullOrgNameTest() {
    JSONObject body = new JSONObject();
    body.put("firstname", "mel");
    body.put("lastname", "car");
    body.put("birthDate", "02-16-1998");
    body.put("email", "email@email");
    body.put("phonenumber", "1234567890");
    body.put("address", "123 park ave");
    body.put("city", "new york");
    body.put("state", "NY");
    body.put("zipcode", "10003");
    body.put("twoFactorOn", false);
    body.put("username", "testUser123");
    body.put("password", "testUser123");
    body.put("personRole", "Worker");
    body.put("orgName", "");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/create-invited-user")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("INVALID_PARAMETER");
  }

  @Test
  public void createInvitedUserSuccessfullyTest() {
    JSONObject body = new JSONObject();
    body.put("firstname", "mel");
    body.put("lastname", "car");
    body.put("birthDate", "02-16-1998");
    body.put("email", "email@email");
    body.put("phonenumber", "1234567890");
    body.put("address", "123 park ave");
    body.put("city", "new york");
    body.put("state", "NY");
    body.put("zipcode", "10003");
    body.put("twoFactorOn", false);
    body.put("username", "testUser123");
    body.put("password", "testUser123");
    body.put("personRole", "Worker");
    body.put("orgName", "Test Org");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/create-invited-user")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("ENROLL_SUCCESS");
  }

  @Test
  public void createUserWithNullRoleTest() {
    JSONObject body = new JSONObject();
    body.put("firstname", "mel");
    body.put("lastname", "car");
    body.put("birthDate", "02-16-1998");
    body.put("email", "email@email");
    body.put("phonenumber", "1234567890");
    body.put("address", "123 park ave");
    body.put("city", "new york");
    body.put("state", "NY");
    body.put("zipcode", "10003");
    body.put("twoFactorOn", false);
    body.put("username", "testUser123");
    body.put("password", "testUser123");
    body.put("personRole", "");
    body.put("orgName", "Test Org");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/create-invited-user")
            .body(body.toString())
            .asString();
    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("INVALID_PRIVILEGE_TYPE");
  }

  @Test
  public void getClients() {
    JSONObject body = new JSONObject();
    body.put("name", "Worker Tff");
    body.put("orgName", "Test Org");
    body.put("privilegeLevel", "Admin");
    body.put("listType", "clients");
    body.put("currentPage", "1");
    body.put("itemsPerPage", "10");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-organization-members")
            .body(body.toString())
            .asString();
    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("SUCCESS");
    assert (actualResponseJSON.has("numPeople"));
    assertThat(actualResponseJSON.getInt("numPeople")).isEqualTo(17);
    assert (actualResponseJSON.has("people"));
  }

  @Test
  public void getMembers() {
    JSONObject body = new JSONObject();
    body.put("name", "Worker Tff");
    body.put("orgName", "Test Org");
    body.put("privilegeLevel", "Client");
    body.put("listType", "members");
    body.put("currentPage", "1");
    body.put("itemsPerPage", "10");

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-organization-members")
            .body(body.toString())
            .asString();
    JSONObject actualResponseJSON = TestUtils.responseStringToJSON(actualResponse.getBody());

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("SUCCESS");
    assert (actualResponseJSON.has("numPeople"));
    assertThat(actualResponseJSON.getInt("numPeople")).isEqualTo(7);
    assert (actualResponseJSON.has("people"));
  }
}
