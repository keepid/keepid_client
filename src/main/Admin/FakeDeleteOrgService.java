package Admin;

import Config.Message;
import Config.Service;
import Organization.Organization;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class FakeDeleteOrgService implements Service {
  MongoDatabase db;
  String orgName;

  JSONObject res = null;

  public FakeDeleteOrgService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {

    // TODO(xander) replace with orgDao when I make it
    MongoCollection<Organization> org = db.getCollection("organization", Organization.class);
    List<Organization> orgsToDelete =
        org.find(Filters.eq("orgName", orgName)).into(new ArrayList<>());

    this.res = new JSONObject();

    res.put("orgs", orgsToDelete);
    return AdminMessages.SUCCESS;
  }
}
