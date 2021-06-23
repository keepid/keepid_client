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

    String username = "username1";
    String password = "password1234";
    String phone = "1231231234";
    String email = "testemail@keep.id";
    EntityFactory.createUser()
        .withUsername(username)
        .withPasswordToHash(password)
        .withPhoneNumber(phone)
        .withEmail(email)
        .buildAndPersist(userDao);

    JSONObject loginRequest = new JSONObject();
    loginRequest.put("username", username);
    loginRequest.put("password", password);

    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/login")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(loginRequest.toString())
            .asString();
  }

  @After
  public void tearDown() {
    userDao.clear();
  }

  @Test
  public void invalidPassword() {
    String username = "username1";
    String password = "wrong";
    JSONObject req = new JSONObject();
    req.put("username", username);
    req.put("password", password);
    HttpResponse<String> res =
        Unirest.post(TestUtils.getServerUrl() + "/delete-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(req.toString())
            .asString();
    JSONObject resJSON = TestUtils.responseStringToJSON(res.getBody());
    assertThat(resJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }

  /**
   * @Test public void nullPassword() {} @Test public void wrongPassword() {} @Test public void
   * successfulUserDeletion() {}
   */
}
