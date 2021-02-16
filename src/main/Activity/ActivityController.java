package Activity;

import Config.DeploymentLevel;
import Config.Message;
import Config.MongoConfig;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

@Slf4j
public class ActivityController {
  MongoDatabase db;

  public ActivityController() {
    this.db = MongoConfig.getDatabase(DeploymentLevel.TEST);
  }

  public void addActivity(Activity activity) {
    String type = activity.getType().get(activity.getType().size() - 1);
    log.info("Trying to add an activity of type " + type);
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    act.insertOne(activity);
    log.info("Successfully added an activity of type " + type);
  }

  public Handler findMyActivities =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        FindActivityService fas = new FindActivityService(db, username);
        Message responseMessage = fas.executeAndGetResponse();
        JSONObject res = responseMessage.toJSON();
        if (responseMessage == UserMessage.SUCCESS) {
          res.put("username", fas.getUsername());
          res.put("activities", fas.getActivitiesArray());
        }
        ctx.result(res.toString());
      };
}
