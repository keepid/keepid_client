package Admin;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

public class FakeDeleteUserService implements Service {
  UserDao userDao;
  String orgName;
  Logger logger;

  JSONObject res = null;

  public FakeDeleteUserService(UserDao userDao, String orgName) {
    this.userDao = userDao;
    this.orgName = orgName;
    logger = LoggerFactory.getLogger("App");
  }

  @Override
  public Message executeAndGetResponse() {
    // TODO(xander) make userdao get all by param? Hacking this right now.
    List<User> users = userDao.getAll();
    users =
        users.stream()
            .filter(x -> orgName.equals(x.getOrganization()))
            .collect(Collectors.toList());
    this.res = new JSONObject();
    res.put("users", users);
    return AdminMessages.SUCCESS;
  }
}
