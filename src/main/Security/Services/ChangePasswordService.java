package Security.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;

import java.util.Objects;
import java.util.Optional;

public class ChangePasswordService implements Service {
  UserDao userDao;
  String username;
  String oldPassword;
  String newPassword;

  public ChangePasswordService(
      UserDao userDao, String username, String oldPassword, String newPassword) {
    this.userDao = userDao;
    this.username = username;
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(userDao);
    Objects.requireNonNull(username);
    Objects.requireNonNull(newPassword);
    Objects.requireNonNull(oldPassword);
    if (!ValidationUtils.isValidUsername(username)
        || !ValidationUtils.isValidPassword(newPassword)) {
      return UserMessage.INVALID_PARAMETER;
    }
    return changePassword(userDao, username, oldPassword, newPassword);
  }

  public static Message changePassword(
      UserDao userDao, String username, String oldPassword, String newPassword) {
    Optional<User> userResult = userDao.get(username);
    if (userResult.isEmpty()) {
      return UserMessage.USER_NOT_FOUND;
    }
    User user = userResult.get();
    String hash = user.getPassword();
    SecurityUtils.PassHashEnum hashStatus = SecurityUtils.verifyPassword(oldPassword, hash);
    if (hashStatus == SecurityUtils.PassHashEnum.ERROR) {
      return UserMessage.SERVER_ERROR;
    } else if (hashStatus == SecurityUtils.PassHashEnum.FAILURE) {
      return UserMessage.AUTH_FAILURE;
    } else {
      String newPasswordHash = SecurityUtils.hashPassword(newPassword);
      userDao.resetPassword(user, newPasswordHash);
    }
    return UserMessage.AUTH_SUCCESS;
  }
}
