package UserTest;

import Config.MongoConfig;
import Security.AccountSecurityController;
import User.UserMessage;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import org.junit.Test;

import static org.mockito.Mockito.*;

/* These are old tests that are redone in TwoFactorHandlerIntegrationTests
 *  This file has been preserved as an example of mocking contexts for tests */

public class AccountSecurityUnitTests {
  Context ctx = mock(Context.class);
  MongoClient testClient = MongoConfig.getMongoClient();
  MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

  // Make sure to enable .env file configurations for these tests

  @Test
  public void nonexistentUser2FATest() throws Exception {
    String inputString = "{\"username\":\"fakeuser\",\"token\":\"123456\"}";

    when(ctx.body()).thenReturn(inputString);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.twoFactorAuth.handle(ctx);

    verify(ctx).json(UserMessage.USER_NOT_FOUND.toJSON());
  }

  @Test
  public void incorrectToken2FATest() throws Exception {
    String inputString = "{\"username\":\"danb\",\"token\":\"123456\"}";

    when(ctx.body()).thenReturn(inputString);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.twoFactorAuth.handle(ctx);

    verify(ctx).json(UserMessage.AUTH_FAILURE.toJSON("2fa token not found for user."));
  }
}
