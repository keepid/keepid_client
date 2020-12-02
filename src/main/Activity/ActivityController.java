package Activity;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Config.Message;
import Logger.LogFactory;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;
import org.slf4j.Logger;

public class ActivityController {
  Logger logger;
  MongoDatabase db;

  public ActivityController() {
    this.db = MongoConfig.getDatabase(DeploymentLevel.TEST);
    LogFactory l = new LogFactory();
    logger = l.createLogger("ActivityController");
  }

  public void addActivity(Activity activity) {
    String type = activity.getType().get(activity.getType().size() - 1);
    logger.info("Trying to add an activity of type " + type);
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    act.insertOne(activity);
    logger.info("Successfully added an activity of type " + type);
  }

  public Handler findMyActivities =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        FindActivityService fas = new FindActivityService(db, logger, username);
        Message responseMessage = fas.executeAndGetResponse();
        JSONObject res = responseMessage.toJSON();
        if (responseMessage == UserMessage.SUCCESS) {
          res.put("username", fas.getUsername());
          res.put("activities", fas.getActivitiesArray());
        }
        ctx.result(res.toString());
      };
  /*
   Request body should contain the type of activity you are looking for. Message me for a complete list.
  */
  //  public Handler findMyActivitiesByType =
  //      ctx -> {
  //        JSONObject res = new JSONObject();
  //        JSONObject req = new JSONObject(ctx.body());
  //        String key = req.getString("type");
  //        String username = ctx.sessionAttribute("username");
  //        MongoCollection<User> users = db.getCollection("user", User.class);
  //        User curr = users.find(eq("username", username)).first();
  //        MongoCollection act = db.getCollection("activity");
  //        MongoCursor cursor =
  //            act.find(and((eq("owner", curr)), eq("type", key)))
  //                .sort(orderBy(descending("occuredAt")))
  //                .iterator();
  //        JSONArray allAct = new JSONArray();
  //        while (cursor.hasNext()) {
  //          Document total = (Document) cursor.next();
  //          Document type = (Document) total.get("type");
  //          List<String> temp = type.getList("type", String.class);
  //          String t = temp.get(temp.size() - 1);
  //          JSONObject activity = new JSONObject();
  //          activity.append("type", t);
  //          String info = total.toJson();
  //          activity.append("info", info);
  //          allAct.put(activity);
  //        }
  //        ctx.json(res.toString());
  //      };
}
