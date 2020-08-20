package UserTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import TestUtils.TestUtils;
import User.IpObject;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class LogInHistoryTest {
  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  @Test
  public void testHistory() {
    TestUtils.login("login-history-test", "login-history-test");
    TestUtils.logout();
    TestUtils.login("login-history-test", "login-history-test");
    TestUtils.logout();
    TestUtils.login("login-history-test", "login-history-test");
    TestUtils.logout();
    TestUtils.login("login-history-test", "login-history-test");
    HttpResponse<String> actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-login-history")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .asString();
    JSONObject res = TestUtils.responseStringToJSON(actualResponse.getBody());
    JSONArray history = res.getJSONArray("history");
    assert (history.length() == 4);
    System.out.println(history);
    JSONObject first = history.getJSONObject(0);
    JSONObject second = history.getJSONObject(1);
    JSONObject penultimate = history.getJSONObject(2);
    JSONObject lastLogin = history.getJSONObject(3);
    ZonedDateTime time = ZonedDateTime.now();
    String date = time.format(DateTimeFormatter.ofPattern("MM/dd/YYYY"));
    assert (lastLogin.get("date").toString().split(",")[0].equals(date));
    assert (lastLogin.get("device").toString().contains("Computer"));
    assert (first.get("location").equals(second.get("location")));
    TestUtils.logout();
    MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User user = userCollection.find(eq("username", "login-history-test")).first();
    List<IpObject> ahistory = user.getLogInHistory();
    assert (ahistory.size() == 4);
    assert (ahistory.get(0).getDevice().equals(ahistory.get(2).getDevice()));
    assert (ahistory.get(1).getIp().equals(ahistory.get(2).getIp()));
    assert (ahistory.get(1).getLocation().equals(ahistory.get(2).getLocation()));
  }
}
