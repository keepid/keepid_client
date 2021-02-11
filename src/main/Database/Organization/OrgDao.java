package Database.Organization;

import Database.Dao;
import Organization.Organization;

import java.util.Optional;

public interface OrgDao extends Dao<Organization> {

  Optional<Organization> get(String orgName);

  void delete(String orgName);
}
