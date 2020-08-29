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
    System.out.println(actualResponseJSON);

    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("INVALID_PARAMETER");
  }
}
