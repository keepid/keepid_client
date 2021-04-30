package Database.UserV2;

import Database.Dao;
import User.V2.BaseUser;

import java.util.Map;
import java.util.Optional;

public interface UserV2Dao extends Dao<BaseUser> {

  Optional<BaseUser> get(String username);

  void update(Map<String, Object> map, String username);
}
