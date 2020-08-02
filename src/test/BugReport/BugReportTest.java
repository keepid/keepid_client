package BugReport;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.fail;

public class BugReportTest {
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
    HttpResponse posted =
        Unirest.post(System.getenv("BUG_REPORT_TESTURL"))
            .header("accept", "application/json")
            .body(input.toString())
            .asEmpty();
    Assert.assertTrue(posted.isSuccess());
  }
}
