package Issue;

import Config.Message;
import Logger.LogFactory;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
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
        String title = req.getString("title");
        String description = req.getString("description");
        String email = req.getString("email");
        SubmitIssueService siService =
            new SubmitIssueService(db, logger, title, description, email);
        Message response = siService.executeAndGetResponse();
        logger.info(response.toString() + response.getErrorDescription());
        JSONObject res = response.toJSON();
        res.put("issueTitle", title);
        res.put("issueDescription", description);
        res.put("issueEmail", email);
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
          res.put("issueEmail", "null");
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
          res.put("issueEmail", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("issueDescription", issueReport.getIssueDescription());
        res.put("issueEmail", issueReport.getIssueEmail());
        ctx.json(res.toString());
        logger.info("Finished with findIssue");
      };
}
