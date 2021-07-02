package Database.UserV2;

import Database.Dao;
import User.V2.BaseUser;

import java.util.Map;

public interface UserV2Dao extends Dao<BaseUser> {

  void update(Map<String, Object> map, String username);
}
