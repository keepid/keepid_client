package UserTest;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

public class TwoFactorHandlerIntegrationTests {

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.tearDownTestDB();
    try {
      TestUtils.setUpTestDB();
    } catch (Exception e) {
      fail(e);
    }
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.stopServer();
    TestUtils.tearDownTestDB();
  }

  @Test
  public void verifyUserWithIncorrectUsernameTest() {
    JSONObject body = new JSONObject();
    body.put("username", "not-a-user");
    body.put("token", "000000");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/two-factor")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message"))
        .isEqualTo("User does not exist in database.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("USER_NOT_FOUND");
  }

  @Test
  public void verifyUserWithNoTokenTest() {
    JSONObject body = new JSONObject();
    body.put("username", "tokentest-notoken");
    body.put("token", "000000");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/two-factor")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("2fa token not found for user.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }

  @Test
  public void verifyUserWithIncorrectTokenTest() {
    JSONObject body = new JSONObject();
    body.put("username", "tokentest-valid");
    body.put("token", "000000");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/two-factor")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("Invalid 2fa token.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }

  @Test
  public void verifyUserWithExpiredTokenTest() {
    JSONObject body = new JSONObject();
    body.put("username", "tokentest-expired");
    body.put("token", "123123");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/two-factor")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("2FA link expired.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }
}
