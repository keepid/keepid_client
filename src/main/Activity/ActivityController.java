package Activity;

import Logger.LogFactory;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Sorts.descending;
import static com.mongodb.client.model.Sorts.orderBy;

public class ActivityController {
  Logger logger;
  MongoDatabase db;

  public ActivityController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("OrgController");
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
        JSONObject res = new JSONObject();
        String username = ctx.sessionAttribute("username");
        MongoCollection<User> user = db.getCollection("user", User.class);
        User curr = user.find(eq("username", username)).first();
        MongoCollection a = db.getCollection("activity");
        MongoCursor cu = a.find().iterator();
        JSONArray allAct = new JSONArray();
        while (cu.hasNext()) {
          Document total = (Document) cu.next();
          Document owner = (Document) total.get("owner");
          if (username.equals(owner.get("username"))) {
            List<String> temp = total.getList("type", String.class);
            String t = temp.get(temp.size() - 1);
            JSONObject activity = new JSONObject();
            activity.append("type", t);
            String info = total.toJson();
            activity.append("info", info);
            allAct.put(activity);
          }
        }
        res.put("allActivities", allAct);
        ctx.json(res.toString());
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
        MongoCursor cursor =
            act.find(and((eq("owner", curr)), eq("type", key)))
                .sort(orderBy(descending("occuredAt")))
                .iterator();
        JSONArray allAct = new JSONArray();
        while (cursor.hasNext()) {
          Document total = (Document) cursor.next();
          Document type = (Document) total.get("type");
          List<String> temp = type.getList("type", String.class);
          String t = temp.get(temp.size() - 1);
          JSONObject activity = new JSONObject();
          activity.append("type", t);
          String info = total.toJson();
          activity.append("info", info);
          allAct.put(activity);
        }
        ctx.json(res.toString());
      };
}
