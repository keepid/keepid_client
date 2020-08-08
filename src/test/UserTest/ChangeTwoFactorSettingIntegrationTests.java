package UserTest;

import Config.MongoConfig;
import Security.AccountSecurityController;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ChangeTwoFactorSettingIntegrationTests {
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

  Context ctx = mock(Context.class);
  MongoClient testClient = MongoConfig.getMongoTestClient();
  MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

  // Make sure to enable .env file configurations for these tests

  @Test
  public void changeTwoFactorFromOffToOnTest() throws Exception {
    String inputString = "{\"twoFactorOn\":true}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn("settings-test-2fa");

    AccountSecurityController asc = new AccountSecurityController(db);
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

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.change2FASetting.handle(ctx);

    // Check that setting was changed
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", "settings-test-2fa")).first();

    assert (user.getTwoFactorOn() == false);
  }
}
