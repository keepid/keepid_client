package Admin;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;

import java.util.List;
import java.util.stream.Collectors;

public class DeleteUserService implements Service {
  UserDao userDao;
  String orgName;

  public DeleteUserService(UserDao userDao, String orgName) {
    this.userDao = userDao;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {
    // TODO(xander) make userdao deleteall by filter?
    List<User> users = userDao.getAll();
    users =
        users.stream()
            .filter(x -> orgName.equals(x.getOrganization()))
            .collect(Collectors.toList());
    for (User user : users) {
      userDao.delete(user.getUsername());
    }
    return AdminMessages.SUCCESS;
  }
}
