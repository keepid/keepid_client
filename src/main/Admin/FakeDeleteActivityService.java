package Admin;

import Activity.Activity;
import Config.Message;
import Config.Service;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class FakeDeleteActivityService implements Service {

  MongoDatabase db;
  String orgName;

  JSONObject res;

  public FakeDeleteActivityService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {
    // TODO(xander) replace with activityDao when I make it
    MongoCollection<Activity> activityMongoCollection =
        db.getCollection("activity", Activity.class);
    List<Activity> activities =
        activityMongoCollection
            .find(Filters.eq("owner.organization", orgName))
            .into(new ArrayList<>());

    this.res = new JSONObject();

    res.put("activities", activities);
    return AdminMessages.SUCCESS;
  }
}
