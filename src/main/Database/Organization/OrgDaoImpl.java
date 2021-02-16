package Database.Organization;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Organization.Organization;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

public class OrgDaoImpl implements OrgDao {
  private MongoCollection<Organization> orgCollection;
  private static final String ORG_ID_KEY = "_id";
  private static final String ORG_NAME_KEY = "orgName";

  public OrgDaoImpl(DeploymentLevel deploymentLevel) {
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("DB cannot be null");
    }
    orgCollection = db.getCollection("organization", Organization.class);
  }

  @Override
  public Optional<Organization> get(String orgName) {
    return Optional.ofNullable(orgCollection.find(eq(ORG_NAME_KEY, orgName)).first());
  }

  @Override
  public Optional<Organization> get(ObjectId id) {
    return Optional.ofNullable(orgCollection.find(eq(ORG_ID_KEY, id)).first());
  }

  @Override
  public List<Organization> getAll() {
    return orgCollection.find().into(new ArrayList<>());
  }

  @Override
  public int size() {
    return (int) orgCollection.countDocuments();
  }

  @Override
  public void delete(Organization organization) {
    orgCollection.deleteOne(eq(ORG_NAME_KEY, organization.getOrgName()));
  }

  @Override
  public void delete(String orgName) {
    orgCollection.deleteOne(eq(ORG_NAME_KEY, orgName));
  }

  @Override
  public void clear() {
    orgCollection.drop();
  }

  @Override
  public void update(Organization organization) {
    orgCollection.replaceOne(eq(ORG_NAME_KEY, organization.getOrgName()), organization);
  }

  @Override
  public void save(Organization organization) {
    orgCollection.insertOne(organization);
  }
}
