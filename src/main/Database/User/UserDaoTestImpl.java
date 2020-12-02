package Database.User;

import Config.DeploymentLevel;
import User.User;
import org.bson.types.ObjectId;

import java.util.*;

public class UserDaoTestImpl implements UserDao {
  Map<String, User> userMap;

  public UserDaoTestImpl(DeploymentLevel deploymentLevel) {
    if (deploymentLevel != DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException(
          "Should not run in memory test database in production or staging");
    }
    userMap = new LinkedHashMap<>();
  }

  @Override
  public Optional<User> get(String username) {
    return Optional.ofNullable(userMap.get(username));
  }

  @Override
  public void delete(String username) {
    userMap.remove(username);
  }

  @Override
  public Optional<User> get(ObjectId id) {
    for (User user : userMap.values()) {
      if (user.getId().equals(id)) {
        return Optional.of(user);
      }
    }
    return Optional.empty();
  }

  @Override
  public List<User> getAll() {
    return new ArrayList<User>(userMap.values());
  }

  @Override
  public int size() {
    return userMap.size();
  }

  @Override
  public void delete(User user) {
    userMap.remove(user.getUsername());
  }

  @Override
  public void clear() {
    userMap.clear();
  }

  @Override
  public void update(User user, String[] params) {
    // implement later
  }

  @Override
  public void save(User user) {
    userMap.put(user.getUsername(), user);
  }
}
