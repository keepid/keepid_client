package Organization;

import Config.Message;
import Config.Service;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

public class ListOrgsService implements Service {
  private MongoDatabase db;
  private Logger logger;
  private JSONArray orgs = new JSONArray();

  public ListOrgsService(MongoDatabase db, Logger logger) {
    this.db = db;
    this.logger = logger;
  }

  @Override
  public Message executeAndGetResponse() {
    logger.info("Querying organizations from Mongo");
    MongoCollection<Organization> orgCollection =
        db.getCollection("organization", Organization.class);

    for (Organization organization : orgCollection.find()) {
      JSONObject curr = new JSONObject(organization);
      orgs.put(curr);
    }

    logger.info("Done creating JSON array of organizations");
    logger.info("Done with listOrgs");
    return UserMessage.SUCCESS;
  }

  public JSONArray getOrgs() {
    return orgs;
  }
}
