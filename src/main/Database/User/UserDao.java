package Database.User;

import Database.Dao;
import User.User;

import java.util.Optional;

public interface UserDao extends Dao<User> {
  Optional<User> get(String username);

  void delete(String username);

  void resetPassword(User user, String newpassword);
}
