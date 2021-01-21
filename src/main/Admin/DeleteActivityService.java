package Admin;

import Activity.Activity;
import Config.Message;
import Config.Service;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;

public class DeleteActivityService implements Service {

  MongoDatabase db;
  String orgName;

  public DeleteActivityService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {
    // TODO(xander) replace with activityDao when I make it
    MongoCollection<Activity> activityMongoCollection =
        db.getCollection("activity", Activity.class);
    activityMongoCollection.deleteMany(Filters.eq("owner.organization", orgName));

    return AdminMessages.SUCCESS;
  }
}
