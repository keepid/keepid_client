package ActivityTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import TestUtils.TestUtils;
import com.mongodb.client.MongoDatabase;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

public class ActivityTest {
  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);

  @Test
  public void testCreateUser() {
    //    MongoCollection<Activity> act = db.getCollection("Activity", Activity.class);
    //    MongoCollection<User> user = db.getCollection("User", User.class);
    //    User user1 = user.find(eq("username", "createAdminOwner")).first();
    //    User user2 = user.find(eq("username", "createdAdmin")).first();
    //    Activity newact = new Activity(user1, "createdAdmin");
    //    act.insertOne(newact);
    //    assert (act.find(eq("created", "createdAdmin")).first() != null);
  }
}
