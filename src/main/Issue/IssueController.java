package Issue;

import Logger.LogFactory;
import Validation.ValidationUtils;
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

public class IssueController {
  MongoDatabase db;
  Logger logger;

  public IssueController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    this.logger = l.createLogger("IssueReportController");
  }

  public static final String issueReportActualURL =
      Objects.requireNonNull(System.getenv("ISSUE_REPORT_ACTUALURL"));
  public static final String issueReportTestURL =
      Objects.requireNonNull(System.getenv("ISSUE_REPORT_TESTURL"));

  public Handler submitIssue =
      ctx -> {
        logger.info("Starting submitIssue");
        logger.info("Trying to get fields from form");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("title");
        String description = req.getString("description");
        String email = req.getString("email");
        if (!ValidationUtils.isValidEmail(email)) {
          logger.error("Issue report has invalid email");
          res.put("status", IssueReportMessage.INVALID_EMAIL.getErrorName());
          res.put("message", IssueReportMessage.INVALID_EMAIL.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        if (null == title || "".equals(title) || null == description || "".equals(description)) {
          logger.error("Issue2 report has no title");
          res.put("status", IssueReportMessage.EMPTY_FIELD.getErrorName());
          res.put("message", IssueReportMessage.EMPTY_FIELD.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        logger.info("Trying to convert the report to a message on Slack");
        JSONArray blocks = new JSONArray();
        JSONObject titleJson = new JSONObject();
        JSONObject titleText = new JSONObject();
        titleText.put("text", "*Issue Title: * " + title);
        titleText.put("type", "mrkdwn");
        titleJson.put("type", "section");
        titleJson.put("text", titleText);
        blocks.put(titleJson);
        JSONObject desJson = new JSONObject();
        JSONObject desText = new JSONObject();
        desText.put("text", "*Issue Description: * " + description);
        desText.put("type", "mrkdwn");
        desJson.put("text", desText);
        desJson.put("type", "section");
        blocks.put(desJson);
        JSONObject input = new JSONObject();
        input.put("blocks", blocks);
        logger.info("Trying to post the message on Slack");
        HttpResponse posted =
            Unirest.post(issueReportActualURL)
                .header("accept", "application/json")
                .body(input.toString())
                .asEmpty();
        logger.info("Trying to add issueReport to database");
        MongoCollection<IssueReport> issueReportCollection =
            db.getCollection("IssueReport", IssueReport.class);
        IssueReport issueReport = new IssueReport(title, description);
        issueReportCollection.insertOne(issueReport);
        if (!posted.isSuccess()) {
          logger.error("Posing on Slack failed");
          res.put("status", IssueReportMessage.SLACK_FAILED.getErrorName());
          res.put("message", IssueReportMessage.SLACK_FAILED.getErrorDescription());
          ctx.json(res.toString());
          return;
        }
        res.put("status", IssueReportMessage.SUCCESS.getErrorName());
        res.put("message", IssueReportMessage.SUCCESS.getErrorDescription());
        ctx.json(res.toString());
        logger.info("Done with submitIssue");
      };
  // Exclusive for testing purposes.
  public Handler findIssue =
      ctx -> {
        logger.info(
            "Starting findIssue (This is never used in a real program. Good for testing purpose.)");
        logger.info("Get title from the form");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("issueTitle");
        if (null == title || "".equals(title)) {
          logger.error("The query has no title");
          res.put("issueTitle", "null");
          res.put("issueDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("issueTitle", title);
        logger.info("Trying to find target report from the database.");
        MongoCollection<IssueReport> issueReportCollection =
            db.getCollection("IssueReport", IssueReport.class);
        IssueReport issueReport = issueReportCollection.find(eq("issueTitle", title)).first();
        if (issueReport == null) {
          logger.info("Target report is not found");
          res.put("issueDescription", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("issueDescription", issueReport.getIssueDescription());
        ctx.json(res.toString());
        logger.info("Finished with findIssue");
      };
}
