package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.IpObject;
import User.User;
import User.UserMessage;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
public class LoginHistoryService implements Service {
  UserDao userDao;
  private String username;
  private JSONArray loginHistoryArray;

  public LoginHistoryService(UserDao userDao, String username) {
    this.userDao = userDao;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    log.info("Started getLogInHistory service");
    this.loginHistoryArray = new JSONArray();
    Optional<User> optionalUser = userDao.get(username);
    if (optionalUser.isEmpty()) {
      log.error("Session Token Failure");
      return UserMessage.SESSION_TOKEN_FAILURE;
    } else {
      List<IpObject> logIns = optionalUser.get().getLogInHistory();
      for (IpObject login : logIns) {
        JSONObject oneLog = new JSONObject();
        oneLog.put("IP", login.getIp());
        oneLog.put("date", login.getDate());
        oneLog.put("location", login.getLocation());
        oneLog.put("device", login.getDevice());
        loginHistoryArray.put(oneLog);
      }
      log.info("Retrieved login history successfully");
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
