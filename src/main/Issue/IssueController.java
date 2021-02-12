package Issue;

import Config.Message;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

@Slf4j
public class IssueController {
  MongoDatabase db;

  public IssueController(MongoDatabase db) {
    this.db = db;
  }

  public static final String issueReportActualURL =
      Objects.requireNonNull(System.getenv("ISSUE_REPORT_ACTUALURL"));
  public static final String issueReportTestURL =
      Objects.requireNonNull(System.getenv("ISSUE_REPORT_TESTURL"));

  public Handler submitIssue =
      ctx -> {
        log.info("Starting submitIssue");
        log.info("Trying to get fields from form");
        JSONObject req = new JSONObject(ctx.body());
        String title = req.getString("title");
        String description = req.getString("description");
        String email = req.getString("email");
        SubmitIssueService siService = new SubmitIssueService(db, title, description, email);
        Message response = siService.executeAndGetResponse();
        log.info(response.toString() + response.getErrorDescription());
        JSONObject res = response.toJSON();
        res.put("issueTitle", title);
        res.put("issueDescription", description);
        res.put("issueEmail", email);
        ctx.json(res.toString());
        log.info("Done with submitIssue");
      };

  // Exclusive for testing purposes.
  public Handler findIssue =
      ctx -> {
        log.info(
            "Starting findIssue (This is never used in a real program. Good for testing purpose.)");
        log.info("Get title from the form");
        JSONObject req = new JSONObject(ctx.body());
        JSONObject res = new JSONObject();
        String title = req.getString("issueTitle");
        if (null == title || "".equals(title)) {
          log.error("The query has no title");
          res.put("issueTitle", "null");
          res.put("issueDescription", "null");
          res.put("issueEmail", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("issueTitle", title);
        log.info("Trying to find target report from the database.");
        MongoCollection<IssueReport> issueReportCollection =
            db.getCollection("IssueReport", IssueReport.class);
        IssueReport issueReport = issueReportCollection.find(eq("issueTitle", title)).first();
        if (issueReport == null) {
          log.info("Target report is not found");
          res.put("issueDescription", "null");
          res.put("issueEmail", "null");
          ctx.json(res.toString());
          return;
        }
        res.put("issueDescription", issueReport.getIssueDescription());
        res.put("issueEmail", issueReport.getIssueEmail());
        ctx.json(res.toString());
        log.info("Finished with findIssue");
      };
}
