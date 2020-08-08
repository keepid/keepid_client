package Bug;

import Logger.LogFactory;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class BugController {
  MongoDatabase db;
  Logger logger;

  public BugController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    this.logger = l.createLogger("BugReportController");
  }

  public static final String bugReportActualURL =
      Objects.requireNonNull(System.getenv("BUG_REPORT_ACTUALURL"));
  public static final String bugReportTestURL =
      Objects.requireNonNull(System.getenv("BUG_REPORT_TESTURL"));

  public Handler submitBug =
      ctx -> {
        logger.info("Starting submitBug");
        logger.info("Trying to get fields from form");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("bugTitle");
        String description = req.getString("bugDescription");
        if (null == title || "".equals(title)) {
          logger.error("Bug report has no title");
          res.put("status", BugReportMessage.NO_TITLE.getErrorName());
          res.put("message", BugReportMessage.NO_TITLE.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        logger.info("Trying to convert the report to a message on Slack");
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
        logger.info("Trying to post the message on Slack");
        HttpResponse posted =
            Unirest.post(bugReportActualURL)
                .header("accept", "application/json")
                .body(input.toString())
                .asEmpty();
        logger.info("Trying to add bugReport to database");
        MongoCollection<BugReport> bugReportCollection =
            db.getCollection("BugReport", BugReport.class);
        BugReport bugReport = new BugReport(title, description);
        bugReportCollection.insertOne(bugReport);
        if (!posted.isSuccess()) {
          logger.error("Posing on Slack failed");
          res.put("status", BugReportMessage.SLACK_FAILED.getErrorName());
          res.put("message", BugReportMessage.SLACK_FAILED.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        res.put("status", BugReportMessage.SUCCESS.getErrorName());
        res.put("message", BugReportMessage.SUCCESS.getErrorDescription());
        ctx.json(res.toString());
        logger.info("Done with submitBug");
      };
  // Exclusive for testing purposes.
  public Handler findBug =
      ctx -> {
        logger.info(
            "Starting findBug (This is never used in a real program. Good for testing purpose.)");
        logger.info("Get title from the form");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("bugTitle");
        if (null == title || "".equals(title)) {
          logger.error("The query has no title");
          res.put("bugTitle", "null");
          res.put("bugDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("bugTitle", title);
        logger.info("Trying to find target report from the database.");
        MongoCollection<BugReport> bugReportCollection =
            db.getCollection("BugReport", BugReport.class);
        BugReport bugReport = bugReportCollection.find(eq("bugTitle", title)).first();
        if (bugReport == null) {
          logger.info("Target report is not found");
          res.put("bugDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("bugDescription", bugReport.getBugDescription());
        ctx.json(res.toString());
        logger.info("Finished with findBug");
      };
}
