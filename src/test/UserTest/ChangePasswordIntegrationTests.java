package UserTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.AccountSecurityController;
import Security.SecurityUtils;
import Security.Tokens;
import TestUtils.TestUtils;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Context;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.security.SecureRandom;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ChangePasswordIntegrationTests {

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  Context ctx = mock(Context.class);
  MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);

  // Make sure to enable .env file configurations for these tests

  // We will switch between these two passwords for simplicity
  String password1 = "a4d3jgHow0";
  String password2 = "9d46kHPkl3";

  private boolean isCorrectPassword(String username, String possiblePassword) {
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", username)).first();

    Argon2 argon2 = Argon2Factory.create();
    char[] possiblePasswordArr = possiblePassword.toCharArray();
    String passwordHash = user.getPassword();

    return argon2.verify(passwordHash, possiblePasswordArr);
  }

  @Test
  public void forgotPasswordCreatesTokenTest() throws Exception {
    String username = "password-reset-test";
    String newPassword = password2;

    // If we are already using password2, switch to password1
    if (isCorrectPassword(username, password2)) {
      newPassword = password1;
    }

    String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
    int expirationTime = 7200000; // 2 hours
    String jwt =
        (new SecurityUtils())
            .createJWT(id, "KeepID", username, "Password Reset Confirmation", expirationTime);

    MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
    tokenCollection.replaceOne(
        eq("username", username),
        new Tokens().setUsername(username).setResetJwt(jwt),
        new ReplaceOptions().upsert(true));

    String inputString = "{\"newPassword\":" + newPassword + ",\"jwt\":" + jwt + "}";

    when(ctx.body()).thenReturn(inputString);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.resetPassword.handle(ctx);

    assert (isCorrectPassword(username, newPassword));
  }

  @Test
  public void resetPasswordWithJWTTest() throws Exception {
    String username = "password-reset-test";
    String newPassword = password2;

    // If we are already using password2, switch to password1
    if (isCorrectPassword(username, password2)) {
      newPassword = password1;
    }

    String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
    int expirationTime = 7200000; // 2 hours
    String jwt =
        (new SecurityUtils())
            .createJWT(id, "KeepID", username, "Password Reset Confirmation", expirationTime);

    MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
    tokenCollection.replaceOne(
        eq("username", username),
        new Tokens().setUsername(username).setResetJwt(jwt),
        new ReplaceOptions().upsert(true));

    String inputString = "{\"newPassword\":" + newPassword + ",\"jwt\":" + jwt + "}";

    when(ctx.body()).thenReturn(inputString);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.resetPassword.handle(ctx);

    assert (isCorrectPassword(username, newPassword));
  }

  @Test
  public void changePasswordWhileLoggedInTest() throws Exception {
    String username = "password-reset-test";
    String oldPassword = "";
    String newPassword = "";

    if (isCorrectPassword(username, password1)) {
      oldPassword = password1;
      newPassword = password2;
    } else if (isCorrectPassword(username, password2)) {
      oldPassword = password2;
      newPassword = password1;
    } else {
      throw new Exception("Current test password doesn't match examples");
    }

    String inputString =
        "{\"oldPassword\":" + oldPassword + ",\"newPassword\":" + newPassword + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changePassword.handle(ctx);

    assert (isCorrectPassword(username, newPassword));
  }

  @Test
  public void changePasswordHelperTest() throws Exception {
    String username = "password-reset-test";
    String oldPassword = "";
    String newPassword = "";

    if (isCorrectPassword(username, password1)) {
      oldPassword = password1;
      newPassword = password2;
    } else if (isCorrectPassword(username, password2)) {
      oldPassword = password2;
      newPassword = password1;
    } else {
      throw new Exception("Current test password doesn't match examples");
    }

    UserMessage result =
        AccountSecurityController.changePassword(
            username, newPassword, oldPassword, db);

    assert (result == UserMessage.AUTH_SUCCESS);
  }
}
