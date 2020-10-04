package User.Services;

import Config.Message;
import Config.Service;
import Database.UserDao;
import User.IpObject;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.List;
import java.util.Objects;

public class LoginHistoryService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private JSONArray loginHistoryArray;

  public LoginHistoryService(MongoDatabase db, Logger logger, String username) {
    this.db = db;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    logger.info("Started getLogInHistory service");
    this.loginHistoryArray = new JSONArray();
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      logger.error("Session Token Failure");
      return UserMessage.SESSION_TOKEN_FAILURE;
    } else {
      List<IpObject> logIns = user.getLogInHistory();
      for (IpObject login : logIns) {
        JSONObject oneLog = new JSONObject();
        oneLog.put("IP", login.getIp());
        oneLog.put("date", login.getDate());
        oneLog.put("location", login.getLocation());
        oneLog.put("device", login.getDevice());
        loginHistoryArray.put(oneLog);
      }
      logger.info("Retrieved login history successfully");
      return UserMessage.SUCCESS;
    }
  }

  public JSONArray getLoginHistoryArray() {
    Objects.requireNonNull(loginHistoryArray);
    return loginHistoryArray;
  }

  public String getUsername() {
    Objects.requireNonNull(username);
    return username;
  }
}
