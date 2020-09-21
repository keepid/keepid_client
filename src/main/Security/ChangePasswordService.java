package Security;

import Activity.ChangeUserAttributesActivity;
import Config.Message;
import Config.Service;
import Database.UserDao;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import java.util.Objects;
import org.slf4j.Logger;

public class ChangePasswordService implements Service {
  MongoDatabase db;
  Logger logger;
  String username;
  String oldPassword;
  String newPassword;

  public ChangePasswordService(
      MongoDatabase db, Logger logger, String username, String oldPassword, String newPassword) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(db);
    Objects.requireNonNull(username);
    Objects.requireNonNull(newPassword);
    Objects.requireNonNull(oldPassword);
    return changePassword(db, username, oldPassword, newPassword);
  }

  public static Message changePassword(
      MongoDatabase db, String username, String oldPassword, String newPassword) {
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }
    String hash = user.getPassword();
    SecurityUtils.PassHashEnum hashStatus = SecurityUtils.verifyPassword(oldPassword, hash);
    if (hashStatus == SecurityUtils.PassHashEnum.ERROR) {
      return UserMessage.SERVER_ERROR;
    } else if (hashStatus == SecurityUtils.PassHashEnum.FAILURE) {
      return UserMessage.AUTH_FAILURE;
    } else {
      UserDao.resetPassword(
          db, user, newPassword, ChangeUserAttributesActivity.class.getSimpleName());
      return UserMessage.AUTH_SUCCESS;
    }
  }
}
