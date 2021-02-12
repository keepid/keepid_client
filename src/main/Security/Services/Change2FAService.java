package Security.Services;

import Activity.ChangeUserAttributesActivity;
import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;
import User.UserMessage;

import java.util.Objects;
import java.util.Optional;

public class Change2FAService implements Service {
  UserDao userDao;
  private String username;
  private Boolean isTwoFactorOn;

  public Change2FAService(UserDao userDao, String username, Boolean isTwoFactorOn) {
    this.userDao = userDao;
    this.username = username;
    this.isTwoFactorOn = isTwoFactorOn;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(userDao);
    Optional<User> userResult = userDao.get(username);
    if (userResult.isEmpty()) {
      return UserMessage.USER_NOT_FOUND;
    }
    User user = userResult.get();
    if (isTwoFactorOn == null) {
      return UserMessage.INVALID_PARAMETER;
    }
    // No current way to validate this boolean
    user.setTwoFactorOn(isTwoFactorOn);
    String oldBoolean = booleanToString(!isTwoFactorOn);
    String newBoolean = booleanToString(isTwoFactorOn);
    new ChangeUserAttributesActivity(user, "twoFactorOn", oldBoolean, newBoolean);
    userDao.update(user);
    return UserMessage.SUCCESS;
  }

  private String booleanToString(Boolean bool) {
    if (bool) {
      return "True";
    } else {
      return "False";
    }
  }
}
