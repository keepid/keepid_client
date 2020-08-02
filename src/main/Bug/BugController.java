package Bug;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class BugController {
  private MongoDatabase db;

  public BugController(MongoDatabase db) {
    this.db = db;
  }

  public static final String bugReportActualURL =
      Objects.requireNonNull(System.getenv("BUG_REPORT_ACTUALURL"));
  public static final String bugReportTestURL =
      Objects.requireNonNull(System.getenv("BUG_REPORT_TESTURL"));

  public Handler submitBug =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("bugTitle");
        String description = req.getString("bugDescription");
        if (null == title || "".equals(title)) {
          res.put("status", BugReportMessage.NO_TITLE.getErrorName());
          res.put("message", BugReportMessage.NO_TITLE.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        JSONArray blocks = new JSONArray();
        JSONObject titleJson = new JSONObject();
        JSONObject titleText = new JSONObject();
        titleText.put("text", "*Bug Title: * " + title);
        titleText.put("type", "mrkdwn");
        titleJson.put("type", "section");
        titleJson.put("text", titleText);
        blocks.put(titleJson);
        JSONObject desJson = new JSONObject();
        JSONObject desText = new JSONObject();
        desText.put("text", "*Bug Description: * " + description);
        desText.put("type", "mrkdwn");
        desJson.put("text", desText);
        desJson.put("type", "section");
        blocks.put(desJson);
        JSONObject input = new JSONObject();
        input.put("blocks", blocks);
        HttpResponse<JsonNode> posted =
            Unirest.post(bugReportActualURL)
                .header("accept", "application/json")
                .body(input.toString())
                .asEmpty();
        MongoCollection<BugReport> bugReportCollection =
            db.getCollection("BugReport", BugReport.class);
        BugReport bugReport = new BugReport(title, description);
        bugReportCollection.insertOne(bugReport);
        if (!posted.isSuccess()) {
          res.put("status", BugReportMessage.SLACK_FAILED.getErrorName());
          res.put("message", BugReportMessage.SLACK_FAILED.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        res.put("status", BugReportMessage.SUCCESS.getErrorName());
        res.put("message", BugReportMessage.SUCCESS.getErrorDescription());
        ctx.json(res.toString());
      };
  // Exclusive for testing purposes.
  public Handler findBug =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("bugTitle");
        if (null == title || "".equals(title)) {
          res.put("bugTitle", "null");
          res.put("bugDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("bugTitle", title);
        MongoCollection<BugReport> bugReportCollection =
            db.getCollection("BugReport", BugReport.class);
        BugReport bugReport = bugReportCollection.find(eq("bugTitle", title)).first();
        if (bugReport == null) {
          res.put("bugDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("bugDescription", bugReport.getBugDescription());
        ctx.json(res.toString());
      };
}
