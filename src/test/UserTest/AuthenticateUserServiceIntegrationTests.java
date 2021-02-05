package UserTest;

import Config.DeploymentLevel;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import TestUtils.EntityFactory;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static TestUtils.TestUtils.*;
import static org.assertj.core.api.Assertions.assertThat;

public class AuthenticateUserServiceIntegrationTests {
  UserDao userDao;

  @Before
  public void configureDatabase() {
    startServer();
    // NEVER USE DEPLOYMENT LEVEL HIGHER THAN TEST
    userDao = UserDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void reset() {
    userDao.clear();
    Unirest.post(getServerUrl() + "/logout");
  }

  @Test
  public void authenticateUser_notLoggedIn() {
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

    JSONObject authUserBody = new JSONObject();
    authUserBody.put("username", username);
    HttpResponse<String> getUserInfoResponse =
        Unirest.post(getServerUrl() + "/authenticate").body(authUserBody.toString()).asString();
    JSONObject authUserBodyJSON = responseStringToJSON(getUserInfoResponse.getBody());
    assertThat(authUserBodyJSON.getString("status")).isEqualTo("AUTH_FAILURE");
  }

  @Test
  public void authenticateUser_loggedIn() {
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
    JSONObject loginBody = new JSONObject();
    loginBody.put("username", username);
    loginBody.put("password", password);
    HttpResponse<String> loginResponse =
        Unirest.post(getServerUrl() + "/login").body(loginBody.toString()).asString();
    JSONObject loginResponseJSON = responseStringToJSON(loginResponse.getBody());
    assertThat(loginResponseJSON.getString("status")).isEqualTo("AUTH_SUCCESS");

    JSONObject authUserBody = new JSONObject();
    authUserBody.put("username", username);
    HttpResponse<String> getUserInfoResponse =
        Unirest.post(getServerUrl() + "/authenticate").body(authUserBody.toString()).asString();
    JSONObject getUserInfoResponseJSON = responseStringToJSON(getUserInfoResponse.getBody());
    assertThat(getUserInfoResponseJSON.getString("status")).isEqualTo("AUTH_SUCCESS");
  }
}
