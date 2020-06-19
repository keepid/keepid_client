package UserTest;

import Config.MongoConfig;
import TestUtils.TestUtils;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class UserControllerIntegrationTest {
  private static Javalin app = Javalin.create();

  @BeforeClass
  public static void setUp() {
    MongoClient testClient = MongoConfig.getMongoClient();
    MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

    UserController userController = new UserController(db);

    app.start(1234);
    app.post("/login", userController.loginUser);
  }

  @AfterClass
  public static void tearDown() {
    app.stop();
  }

  @Test
  public void loginUserWithNoUsernameTest() {
    JSONObject body = new JSONObject();
    body.put("password", "pass");
    body.put("username", "");

    HttpResponse actualResponse =
        Unirest.post("http://localhost:1234/login")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

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
