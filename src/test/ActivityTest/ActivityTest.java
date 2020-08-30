package ActivityTest;

import Activity.Activity;
import Activity.DeleteActivity;
import Config.DeploymentLevel;
import Config.MongoConfig;
import PDF.PDFType;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.types.ObjectId;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static com.mongodb.client.model.Filters.eq;

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
    //    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    //    MongoCollection<User> user = db.getCollection("user", User.class);
    //    User user1 = user.find(eq("username", "createAdminOwner")).first();
    //    User user2 = user.find(eq("username", "createdAdmin")).first();
    //    CreateAdminActivity av = new CreateAdminActivity(user1, user2);
    //    //    CreateWorkerActivity ac = new CreateWorkerActivity(user1, user2);
    //    act.insertOne(av);
    //    //    act.insertOne(ac);
    //    MongoCollection a = db.getCollection("activity");
    //    Document d =
    //        (Document)
    //            a.find(eq("created", user2))
    //                .projection(fields(include("created"), excludeId()))
    //                .first();
    //    Document b = (Document) d.get("created");
    //    System.out.println(b);
    //    assert (b.get("lastName").equals("Chen"));
    //    CreateAdminActivity a = (CreateAdminActivity) cursor.next();
    //    assert (a.getCreated().getLastName().equals("Chen"));
    //    assert (cursor.hasNext());
  }
  //
  //  @Test
  //  public void testProjection() {
  //    MongoCollection col = db.getCollection("user");
  //    Document d =
  //        (Document)
  //            col.find(eq("username", "createAdminOwner"))
  //                .projection(fields(include("firstName"), excludeId()))
  //                .first();
  //    String old = d.get("firstName").toString();
  //    System.out.print(old);
  //    assert (old.equals("Cathy"));
  //  }

  //  @Test
  //  public void testFoo() {
  //    MongoCollection<Super> act = db.getCollection("super", Super.class);
  //    Super newact = new Super("hi", PDFType.FORM);
  //    act.insertOne(newact);
  //    assert (act.find(eq("en", PDFType.FORM)).first() != null);
  //  }
  @Test
  public void testDocument() {
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    MongoCollection<User> user = db.getCollection("user", User.class);
    User user1 = user.find(eq("username", "createAdminOwner")).first();
    User user2 = user.find(eq("username", "createdAdmin")).first();
    ObjectId id = new ObjectId();
    System.out.print(id);
    DeleteActivity deleteActivity = new DeleteActivity(user1, user2, PDFType.FORM, id);
    act.insertOne(deleteActivity);
    assert (act.find(eq("documentOwner", user2)).first().getOwner().getLastName().equals("Chen"));
    assert (act.find(eq("documentType", PDFType.FORM.toString())).first() != null);
  }
}
