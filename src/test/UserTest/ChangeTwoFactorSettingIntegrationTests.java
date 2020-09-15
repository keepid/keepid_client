package UserTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.AccountSecurityController;
import Security.EncryptionController;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;

import static com.mongodb.client.model.Filters.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ChangeTwoFactorSettingIntegrationTests {
  Context ctx = mock(Context.class);
  static MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);
  static EncryptionController encryptionController;

  @BeforeClass
  public static void setUp() throws GeneralSecurityException, IOException {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    encryptionController = new EncryptionController(db);
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  // Make sure to enable .env file configurations for these tests

  @Test
  public void changeTwoFactorFromOffToOnTest() throws Exception {
    String inputString = "{\"twoFactorOn\":true}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn("settings-test-2fa");

    AccountSecurityController asc = new AccountSecurityController(db, encryptionController);
    asc.change2FASetting.handle(ctx);

    // Check that setting was changed
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", "settings-test-2fa")).first();

    assert (user.getTwoFactorOn() == true);
  }

  @Test
  public void changeTwoFactorFromOnToOffTest() throws Exception {
    String inputString = "{\"twoFactorOn\":false}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn("settings-test-2fa");

    AccountSecurityController asc = new AccountSecurityController(db, encryptionController);
    asc.change2FASetting.handle(ctx);

    // Check that setting was changed
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", "settings-test-2fa")).first();

    assert (user.getTwoFactorOn() == false);
  }
}
