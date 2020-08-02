package BugReport;

import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;

import java.util.Objects;

public class BugReportTest {
  public static final String bugReportTestURL =
      Objects.requireNonNull(System.getenv("BUG_REPORT_TESTURL"));

  @Test
  public void testBlocks() {
    JSONArray blocks = new JSONArray();
    JSONObject titleJson = new JSONObject();
    JSONObject titleText = new JSONObject();
    titleText.put("text", "*Bug Title: * hi");
    titleText.put("type", "mrkdwn");
    titleJson.put("type", "section");
    titleJson.put("text", titleText);
    blocks.put(titleJson);
    JSONObject desJson = new JSONObject();
    JSONObject desText = new JSONObject();
    desText.put("text", "*Bug Description: * ye");
    desText.put("type", "mrkdwn");
    desJson.put("text", desText);
    desJson.put("type", "section");
    blocks.put(desJson);
    JSONObject input = new JSONObject();
    input.put("blocks", blocks);
    HttpResponse<JsonNode> posted =
        Unirest.post(bugReportTestURL)
            .header("accept", "application/json")
            .body(input.toString())
            .asEmpty();
    Assert.assertTrue(posted.isSuccess());
  }

  @Test
  public void getEnvWorks() {
    String testURL = System.getenv("BUG_REPORT_TESTURL");
    Assert.assertEquals(
        testURL, "https://hooks.slack.com/services/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");
  }

  @Test
  public void getACTUALWorks() {
    String testURL = System.getenv("BUG_REPORT_ACTUALURL");
    Assert.assertEquals(
        testURL, "https://hooks.slack.com/services/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");
  }
}
