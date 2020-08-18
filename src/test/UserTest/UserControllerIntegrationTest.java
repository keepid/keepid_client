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
import static org.mockito.Mockito.mock;

public class UserControllerIntegrationTest {

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
    TestUtils.stopServer();
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
}
