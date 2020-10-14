package IssueReport;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.Objects;

public class IssueReportTest {
  public static final String issueReportTestURL =
      Objects.requireNonNull(System.getenv("ISSUE_REPORT_TESTURL"));

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
  public void testBlocks() {
    JSONArray blocks = new JSONArray();
    JSONObject titleJson = new JSONObject();
    JSONObject titleText = new JSONObject();
    titleText.put("text", "*Issue Title: * hi");
    titleText.put("type", "mrkdwn");
    titleJson.put("type", "section");
    titleJson.put("text", titleText);
    blocks.put(titleJson);
    JSONObject desJson = new JSONObject();
    JSONObject desText = new JSONObject();
    desText.put("text", "*Issue Description: * ye");
    desText.put("type", "mrkdwn");
    desJson.put("text", desText);
    desJson.put("type", "section");
    blocks.put(desJson);
    JSONObject input = new JSONObject();
    input.put("blocks", blocks);
    HttpResponse posted =
        Unirest.post(System.getenv("ISSUE_REPORT_TESTURL"))
            .header("accept", "application/json")
            .body(input.toString())
            .asEmpty();
    assert (posted.isSuccess());
  }

  // I commented the test below as it would send a message in bug reports channel in slack when run.
  // If you wish to test
  // locally, please change the url in the IssueController to bugReportTestURL so this will only
  // send
  // message the test channel.
  // If you are not sure which one to put, contact me @cathy chen on slack.
  @Test
  public void testMongo() {
    //    JSONObject body = new JSONObject();
    //    body.put("bugTitle", "mongo1");
    //    body.put("bugDescription", "mongo2");
    //    HttpResponse<String> submitResponse =
    //        Unirest.post(TestUtils.getServerUrl() +
    // "/submit-bug").body(body.toString()).asString();
    //    assert ("SUCCESS"
    //
    // .equals(TestUtils.responseStringToJSON(submitResponse.getBody()).getString("status")));
    //    body = new JSONObject();
    //    body.put("bugTitle", "mongo1");
    //    HttpResponse<String> findResponse =
    //        Unirest.post(TestUtils.getServerUrl() + "/find-bug").body(body.toString()).asString();
    //    assert ("mongo2"
    //        .equals(
    //
    // TestUtils.responseStringToJSON(findResponse.getBody()).getString("bugDescription")));
  }
}
