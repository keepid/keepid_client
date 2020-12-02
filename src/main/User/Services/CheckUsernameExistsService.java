package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;
import User.UserMessage;
import org.slf4j.Logger;

import java.util.Optional;

public class CheckUsernameExistsService implements Service {
  UserDao userDao;
  Logger logger;
  String username;

  public CheckUsernameExistsService(UserDao userDao, Logger logger, String username) {
    this.userDao = userDao;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    Optional<User> user = userDao.get(username);
    if (user.isEmpty()) {
      logger.info("Username not taken.");
      return UserMessage.SUCCESS;
    } else {
      logger.error("Username already exists.");
      return UserMessage.USERNAME_ALREADY_EXISTS;
    }
  }
}
