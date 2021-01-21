package Admin;

import Config.Message;
import Config.Service;
import Organization.Organization;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;

import java.util.ArrayList;
import java.util.List;

public class DeleteOrgService implements Service {
  MongoDatabase db;
  String orgName;

  public DeleteOrgService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {

    // TODO(xander) replace with orgDao when I make it
    MongoCollection<Organization> org = db.getCollection("organization", Organization.class);
    List<Organization> orgs = org.find(Filters.eq("orgName", orgName)).into(new ArrayList<>());

    if (orgs.size() <= 0) {
      return AdminMessages.ORG_ERROR;
    }

    org.deleteMany(Filters.eq("orgName", orgName));
    return AdminMessages.SUCCESS;
  }
}
