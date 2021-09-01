package Database.User;

import Database.Dao;
import User.User;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;

public interface UserDao extends Dao<User> {

  List<User> getAllFromOrg(String orgName);

  List<User> getAllFromOrg(ObjectId id);

  Optional<User> get(String username);

  void delete(String username);

  void resetPassword(User user, String newpassword);
}
