package Database.Organization;

import Config.DeploymentLevel;
import Organization.Organization;
import org.bson.types.ObjectId;

import java.util.*;

public class OrgDaoTestImpl implements OrgDao {
  Map<String, Organization> orgMap;

  public OrgDaoTestImpl(DeploymentLevel deploymentLevel) {
    if (deploymentLevel != DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException(
          "Should not run in memory test database in production or staging");
    }
    orgMap = new LinkedHashMap<>();
  }

  @Override
  public Optional<Organization> get(String orgName) {
    return Optional.ofNullable(orgMap.get(orgName));
  }

  @Override
  public Optional<Organization> get(ObjectId id) {
    for (Organization organization : orgMap.values()) {
      if (organization.getId().equals(id)) {
        return Optional.of(organization);
      }
    }
    return Optional.empty();
  }

  @Override
  public List<Organization> getAll() {
    return new ArrayList<Organization>(orgMap.values());
  }

  @Override
  public int size() {
    return orgMap.size();
  }

  @Override
  public void clear() {
    orgMap.clear();
  }

  @Override
  public void delete(Organization organization) {
    orgMap.remove(organization.getOrgName());
  }

  @Override
  public void delete(String orgName) {
    orgMap.remove(orgName);
  }

  @Override
  public void delete(ObjectId objectId) {
    // TODO
  }

  @Override
  public void update(Organization organization) {
    if (orgMap.containsKey(organization.getOrgName())) {
      orgMap.put(organization.getOrgName(), organization);
    }
  }

  @Override
  public void save(Organization organization) {
    orgMap.put(organization.getOrgName(), organization);
  }
}
