package ActivityTest;

import Activity.Activity;
import Activity.CreateAdminActivity;
import Activity.CreateWorkerActivity;
import Activity.LoginActivity;
import Config.DeploymentLevel;
import Config.MongoConfig;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.bson.Document;
import org.json.JSONObject;
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
  //    MongoCursor cursor = act.find(eq("owner", user1)).iterator();
  //    System.out.print(cursor.next().getClass());
  //    assert (cursor.hasNext());
  //    assert (act.find(eq("type", "CreateUserActivity")).first() != null);
  //  }
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
  //
  @Test
  public void testMoreProjection() {
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    MongoCollection<User> user = db.getCollection("user", User.class);
    User user1 = user.find(eq("username", "createAdminOwner")).first();
    User user2 = user.find(eq("username", "createdAdmin")).first();
    CreateAdminActivity av = new CreateAdminActivity(user1, user2);
    CreateWorkerActivity ac = new CreateWorkerActivity(user1, user2);
    act.insertOne(av);
    act.insertOne(ac);
    MongoCollection a = db.getCollection("activity");
    Document d = (Document) a.find(eq("owner", user1)).first();
    Document b = (Document) d.get("created");
    //    System.out.println(b);
    assert (b.get("lastName").equals("Chen"));
  }
  //
  //  @Test
  //  public void testFoo() {
  //    MongoCollection<Super> act = db.getCollection("super", Super.class);
  //    Super newact = new Super("hi", PDFType.FORM);
  //    act.insertOne(newact);
  //    assert (act.find(eq("en", PDFType.FORM)).first() != null);
  //  }
  //
  //  @Test
  //  public void testDocument() {
  //    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
  //    MongoCollection<User> user = db.getCollection("user", User.class);
  //    User user1 = user.find(eq("username", "createAdminOwner")).first();
  //    User user2 = user.find(eq("username", "createdAdmin")).first();
  //    ObjectId id = new ObjectId();
  //    DeleteActivity deleteActivity = new DeleteActivity(user1, user2, PDFType.FORM, id);
  //    act.insertOne(deleteActivity);
  //    assert (act.find(eq("documentOwner",
  // user2)).first().getOwner().getLastName().equals("Chen"));
  //    assert (act.find(eq("documentType", PDFType.FORM.toString())).first() != null);
  //  }
  //
  @Test
  public void testController() {
    TestUtils.login("createAdminOwner", "login-history-test");
    JSONObject body = new JSONObject();
    body.put("username", "createAdminOwner");

    HttpResponse<String> findResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-all-activities")
            .body(body.toString())
            .asString();
    assert (findResponse.getBody().contains(LoginActivity.class.getSimpleName()));
    TestUtils.logout();
  }

  @Test
  public void testLogin() {
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    MongoCollection<User> user = db.getCollection("user", User.class);
    User user1 = user.find(eq("username", "createAdminOwner")).first();
    TestUtils.login("createAdminOwner", "login-history-test");
    MongoCollection a = db.getCollection("activity");
    MongoCursor c = a.find(eq("owner", user1)).iterator();
    assert (c.hasNext());
    TestUtils.logout();
  }
}
