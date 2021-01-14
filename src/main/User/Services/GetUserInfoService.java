package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;
import User.UserMessage;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;
import java.util.Optional;

public class GetUserInfoService implements Service {
  private UserDao userDao;
  private Logger logger;
  private String username;
  private User user;

  public GetUserInfoService(UserDao userDao, Logger logger, String username) {
    this.userDao = userDao;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(username);
    Objects.requireNonNull(logger);
    Optional<User> optionalUser = userDao.get(username);
    if (optionalUser.isEmpty()) {
      logger.error("Session Token Failure");
      return UserMessage.USER_NOT_FOUND;
    } else {
      this.user = optionalUser.get();
      logger.info("Successfully got user info");
      return UserMessage.SUCCESS;
    }
  }

  public JSONObject getUserFields() {
    Objects.requireNonNull(user);
    JSONObject userObject = new JSONObject();
    userObject.put("userRole", this.user.getUserType());
    userObject.put("organization", user.getOrganization());
    userObject.put("firstName", user.getFirstName());
    userObject.put("lastName", user.getLastName());
    userObject.put("birthDate", user.getBirthDate());
    userObject.put("address", user.getAddress());
    userObject.put("city", user.getCity());
    userObject.put("state", user.getState());
    userObject.put("zipcode", user.getZipcode());
    userObject.put("email", user.getEmail());
    userObject.put("phone", user.getPhone());
    userObject.put("twoFactorOn", user.getTwoFactorOn());
    userObject.put("username", user.getUsername());
    return userObject;
  }
}
