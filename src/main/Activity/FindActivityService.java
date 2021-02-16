package Activity;

import Config.Message;
import Config.Service;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.Objects;

public class FindActivityService implements Service {
  MongoDatabase db;
  private String username;
  private JSONObject findActivity;

  public FindActivityService(MongoDatabase db, String username) {
    this.db = db;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    findActivity = new JSONObject();
    MongoCollection<Document> a = db.getCollection("activity", Document.class);
    MongoCursor<Document> cu = a.find().iterator();
    JSONArray allAct = new JSONArray();
    while (cu.hasNext()) {
      Document total = cu.next();
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
    findActivity.put("allActivities", allAct);
    return UserMessage.SUCCESS;
  }

  public JSONObject getActivitiesArray() {
    Objects.requireNonNull(findActivity);
    return findActivity;
  }

  public String getUsername() {
    Objects.requireNonNull(username);
    return username;
  }
}
