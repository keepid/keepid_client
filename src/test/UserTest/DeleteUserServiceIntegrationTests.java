package UserTest;

import Config.DeploymentLevel;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import TestUtils.EntityFactory;
import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class DeleteUserServiceIntegrationTests {
  UserDao userDao;

  @Before
  public void setUp() {
    TestUtils.startServer();
    userDao = UserDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void tearDown() {
    userDao.clear();
  }

  @Test
  public void wrongPassword() {
    String username = "testfishmir";
    String password = "password1234";
    EntityFactory.createUser()
        .withUsername(username)
        .withPasswordToHash(password)
        .buildAndPersist(userDao);
    JSONObject loginRequest = new JSONObject();
    loginRequest.put("username", username);
    loginRequest.put("password", password);
    HttpResponse<String> loginResponse =
        Unirest.post(TestUtils.getServerUrl() + "/login")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(loginRequest.toString())
            .asString();

    String testPassword = "wrongPassword";
    JSONObject req = new JSONObject();
    req.put("password", testPassword);
    HttpResponse<String> res =
        Unirest.post(TestUtils.getServerUrl() + "/delete-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(req.toString())
            .asString();
    JSONObject resJSON = TestUtils.responseStringToJSON(res.getBody());

    assertThat(resJSON.getString("status")).isEqualTo("AUTH_FAILURE");
    assertThat(userDao.get(username).isEmpty()).isFalse();

    userDao.delete(username);
  }

  @Test
  public void successfulAccountDeletion() {
    String username = "testfishmir";
    String password = "password1234";
    EntityFactory.createUser()
        .withUsername(username)
        .withPasswordToHash(password)
        .buildAndPersist(userDao);
    JSONObject loginRequest = new JSONObject();
    loginRequest.put("username", username);
    loginRequest.put("password", password);
    HttpResponse<String> loginResponse =
        Unirest.post(TestUtils.getServerUrl() + "/login")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(loginRequest.toString())
            .asString();

    JSONObject req = new JSONObject();
    req.put("password", password);
    HttpResponse<String> res =
        Unirest.post(TestUtils.getServerUrl() + "/delete-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(req.toString())
            .asString();
    JSONObject resJSON = TestUtils.responseStringToJSON(res.getBody());

    assertThat(resJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(userDao.get(username).isEmpty()).isTrue();
  }
}
