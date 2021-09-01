package Database.Organization;

import Database.Dao;
import Organization.Organization;
import org.bson.types.ObjectId;

import java.util.Optional;

public interface OrgDao extends Dao<Organization> {

  Optional<Organization> get(String orgName);

  void delete(String orgName);

  void delete(ObjectId objectId);
}
