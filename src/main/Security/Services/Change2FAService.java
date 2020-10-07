package Security.Services;

import Activity.ChangeUserAttributesActivity;
import Config.Message;
import Config.Service;
import Database.UserDao;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;

import java.util.Objects;

public class Change2FAService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private Boolean isTwoFactorOn;

  public Change2FAService(MongoDatabase db, Logger logger, String username, Boolean isTwoFactorOn) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.isTwoFactorOn = isTwoFactorOn;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(db);
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }
    if (isTwoFactorOn == null) {
      return UserMessage.INVALID_PARAMETER;
    }
    // No current way to validate this boolean
    user.setTwoFactorOn(isTwoFactorOn);
    String oldBoolean = booleanToString(!isTwoFactorOn);
    String newBoolean = booleanToString(isTwoFactorOn);
    new ChangeUserAttributesActivity(user, "twoFactorOn", oldBoolean, newBoolean);
    UserDao.replaceUser(db, user);
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
