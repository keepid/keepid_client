package User.Services;

import Config.Message;
import Config.Service;
import Database.UserDao;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;

public class CheckUsernameExistsService implements Service {
  MongoDatabase db;
  Logger logger;
  String username;

  public CheckUsernameExistsService(MongoDatabase db, Logger logger, String username) {
    this.db = db;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    User user = UserDao.findOneUserOrNull(db, username);
    if (user != null) {
      logger.info("Username not taken.");
      return UserMessage.SUCCESS;
    } else {
      logger.error("Username already exists.");
      return UserMessage.USERNAME_ALREADY_EXISTS;
    }
  }
}
