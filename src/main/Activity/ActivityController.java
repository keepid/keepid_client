package Activity;

import Logger.LogFactory;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;

public class ActivityController {
  Logger logger;
  MongoDatabase db;

  public ActivityController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("OrgController");
  }

  public void addActivity(Activity activity) {
    logger.info("Trying to add an activity");
    MongoCollection<Activity> act = db.getCollection("activity", Activity.class);
    act.insertOne(activity);
    logger.info("Successfully added an activity");
  }
}
