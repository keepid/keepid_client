package Organization.Services;

import Config.Message;
import Config.Service;
import Organization.Organization;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;

@Slf4j
public class ListOrgsService implements Service {
  private MongoDatabase db;
  private JSONArray orgs = new JSONArray();

  public ListOrgsService(MongoDatabase db) {
    this.db = db;
  }

  @Override
  public Message executeAndGetResponse() {
    log.info("Querying organizations from Mongo");
    MongoCollection<Organization> orgCollection =
        db.getCollection("organization", Organization.class);

    for (Organization organization : orgCollection.find()) {
      JSONObject curr = new JSONObject(organization);
      orgs.put(curr);
    }

    log.info("Done creating JSON array of organizations");
    log.info("Done with listOrgs");
    return UserMessage.SUCCESS;
  }

  public JSONArray getOrgs() {
    return orgs;
  }
}
