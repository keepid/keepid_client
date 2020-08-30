package ActivityTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import ForFun.Super;
import PDF.PDFType;
import TestUtils.TestUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.*;

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

  //  @Test
  //  public void testCreateUser() {
  //    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
  //    MongoCollection<User> user = db.getCollection("user", User.class);
  //    User user1 = user.find(eq("username", "createAdminOwner")).first();
  //    User user2 = user.find(eq("username", "createdAdmin")).first();
  //    CreateAdminActivity av = new CreateAdminActivity(user1, user2);
  //    CreateWorkerActivity ac = new CreateWorkerActivity(user1, user2);
  //    act.insertOne(av);
  //    act.insertOne(ac);
  //    MongoCursor<Activity> cursor = act.find(eq("type", "CreateUserActivity")).iterator();
  //    assert (cursor.hasNext());
  //    assert (cursor.next().getOwner().getLastName().equals("Chen"));
  //    assert (cursor.hasNext());
  //  }

  @Test
  public void testProjection() {
    MongoCollection col = db.getCollection("user");
    Document d =
        (Document)
            col.find(eq("username", "createAdminOwner"))
                .projection(fields(include("firstName"), excludeId()))
                .first();
    String old = d.get("firstName").toString();
    System.out.print(old);
    assert (old.equals("Cathy"));
  }

  @Test
  public void testFoo() {
    MongoCollection<Super> act = db.getCollection("super", Super.class);
    Super newact = new Super("hi", PDFType.FORM);
    act.insertOne(newact);
    assert (act.find(eq("en", PDFType.FORM)).first() != null);
  }
}
