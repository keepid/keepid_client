package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.UserMessage;
import Validation.ValidationUtils;
import org.slf4j.Logger;

public class AuthenticateUserService implements Service {
  UserDao userDao;
  Logger logger;
  private String username;
  private String sesionUsername;

  public AuthenticateUserService(
      UserDao userDao, Logger logger, String username, String sessionUsername) {
    this.userDao = userDao;
    this.logger = logger;
    this.username = username;
    this.sesionUsername = sessionUsername;
  }

  @Override
  public Message executeAndGetResponse() {
    if (!ValidationUtils.isValidUsername(username)) {
      return UserMessage.USER_NOT_FOUND;
    }
    if (sesionUsername == null) {
      return UserMessage.AUTH_FAILURE;
    } else if (!username.equals(sesionUsername)) {
      return UserMessage.AUTH_FAILURE;
    } else {
      return UserMessage.AUTH_SUCCESS;
    }
  }
}
