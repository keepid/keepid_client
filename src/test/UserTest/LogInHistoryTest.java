package UserTest;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

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

  /*
  Please change the date, timezone, and device(if you are running it on laptop, it should be desktop) as you test.
  Also, the location will show up as null because this test runs on local server where the IP address is essentially
  unreadable.
  I commented out because under a free plan, we get limited requests at look up ip addresses. With each test,
  we will use one request.
   */
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
    JSONObject lastLogin = history.getJSONObject(3);
    System.out.println(lastLogin.toString());
    assert (lastLogin.get("date").toString().contains("8/19/2020"));
    assert (lastLogin.get("device").toString().contains("Computer"));
    TestUtils.logout();
  }
}
