package UserTest;

import Config.DeploymentLevel;
import Config.Message;
import Config.MongoConfig;
import Database.Token.TokenDao;
import Database.Token.TokenDaoFactory;
import Database.Token.TokenDaoOld;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import Security.SecurityUtils;
import Security.Services.ChangePasswordService;
import Security.Services.ForgotPasswordService;
import Security.Services.ResetPasswordService;
import Security.Tokens;
import TestUtils.TestUtils;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Context;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;

public class ChangePasswordIntegrationTests {
  private static final int EXPIRATION_TIME_2_HOURS = 7200000;

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
  UserDao userDao = UserDaoFactory.create(DeploymentLevel.TEST);
  TokenDao tokenDao = TokenDaoFactory.create(DeploymentLevel.TEST);

  // Make sure to enable .env file configurations for these tests

  // We will switch between these two passwords for simplicity
  String password1 = "a4d3jgHow0";
  String password2 = "9d46kHPkl3";

  private boolean isCorrectPassword(String username, String possiblePassword) {
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", username)).first();
    if (user == null) {
      return false;
    }
    Argon2 argon2 = Argon2Factory.create();
    char[] possiblePasswordArr = possiblePassword.toCharArray();
    String passwordHash = user.getPassword();
    return argon2.verify(passwordHash, possiblePasswordArr);
  }

  @Test
  public void forgotPasswordCreatesTokenTest() {
    String username = "password-reset-test";
    ForgotPasswordService forgotPasswordService =
        new ForgotPasswordService(userDao, tokenDao, username);
    Message returnMessage = forgotPasswordService.executeAndGetResponse();
    assertEquals(UserMessage.SUCCESS, returnMessage);
    Tokens tokens = tokenDao.get(username).get();
    assertEquals(1, tokens.numTokens());
    TokenDaoOld.removeTokenIfLast(db, username, tokens, Tokens.TokenType.PASSWORD_RESET);
  }

  @Test
  public void resetPasswordWithJWTTest() throws Exception {
    String username = "password-reset-test";
    String id = SecurityUtils.generateRandomStringId();
    String jwt =
        SecurityUtils.createJWT(
            id, "KeepID", username, "Password Reset Confirmation", EXPIRATION_TIME_2_HOURS);
    ResetPasswordService forgotPasswordService =
        new ResetPasswordService(userDao, tokenDao, jwt, username);
    Message returnMessage = forgotPasswordService.executeAndGetResponse();
    assertEquals(UserMessage.AUTH_FAILURE, returnMessage);
    Tokens tokens = TokenDaoOld.getTokensOrNull(db, username);
    assertNull(tokens);
  }
  //
  //  @Test
  //  public void changePasswordWhileLoggedInTest() throws Exception {
  //    String username = "password-reset-test";
  //    String oldPassword = "";
  //    String newPassword = "";
  //
  //    if (isCorrectPassword(username, password1)) {
  //      oldPassword = password1;
  //      newPassword = password2;
  //    } else if (isCorrectPassword(username, password2)) {
  //      oldPassword = password2;
  //      newPassword = password1;
  //    } else {
  //      throw new Exception("Current test password doesn't match examples");
  //    }
  //
  //    String inputString =
  //        "{\"oldPassword\":" + oldPassword + ",\"newPassword\":" + newPassword + "}";
  //
  //    when(ctx.body()).thenReturn(inputString);
  //    when(ctx.sessionAttribute("username")).thenReturn(username);
  //
  //    AccountSecurityController asc = new AccountSecurityController(db);
  //    asc.changePassword.handle(ctx);
  //
  //    assert (isCorrectPassword(username, newPassword));
  //  }

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

    Message result =
        ChangePasswordService.changePassword(userDao, username, oldPassword, newPassword);
    assert (result == UserMessage.AUTH_SUCCESS);
  }
}
