package Security.Services;

import Activity.ActivityController;
import Activity.ChangeUserAttributesActivity;
import Config.Message;
import Config.Service;
import Database.User.UserDao;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;
import java.util.Optional;

public class ChangeAccountSettingService implements Service {
  UserDao userDao;
  Logger logger;
  private String username;
  private String password;
  private String key;
  private String value;

  public ChangeAccountSettingService(
      UserDao userDao, Logger logger, String username, String password, String key, String value) {
    this.userDao = userDao;
    this.logger = logger;
    this.username = username;
    this.password = password;
    this.key = key;
    this.value = value;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(userDao);
    Objects.requireNonNull(username);
    Objects.requireNonNull(password);
    Objects.requireNonNull(key);
    Objects.requireNonNull(value);

    Optional<User> userResult = userDao.get(username);
    if (userResult.isEmpty()) {
      return UserMessage.USER_NOT_FOUND;
    }
    User user = userResult.get();

    String hash = user.getPassword();
    SecurityUtils.PassHashEnum verifyStatus = SecurityUtils.verifyPassword(password, hash);
    if (verifyStatus == SecurityUtils.PassHashEnum.ERROR) {
      return UserMessage.SERVER_ERROR;
    }
    if (verifyStatus == SecurityUtils.PassHashEnum.FAILURE) {
      return UserMessage.AUTH_FAILURE;
    }
    JSONObject userAsJson = user.serialize();
    String old = userAsJson.get(key).toString();
    ActivityController activityController = new ActivityController();
    ChangeUserAttributesActivity act = new ChangeUserAttributesActivity(user, key, old, value);
    activityController.addActivity(act);
    switch (key) {
      case "firstName":
        if (!ValidationUtils.isValidFirstName(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid First Name");
        }
        user.setFirstName(value);
        break;
      case "lastName":
        if (!ValidationUtils.isValidLastName(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Last Name");
        }
        user.setLastName(value);
        break;
      case "birthDate":
        if (!ValidationUtils.isValidBirthDate(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Birth Date Name");
        }
        user.setBirthDate(value);
        break;
      case "phone":
        if (!ValidationUtils.isValidPhoneNumber(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Phone Number");
        }
        user.setPhone(value);
        break;
      case "email":
        if (!ValidationUtils.isValidEmail(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Email");
        }
        user.setEmail(value);
        break;
      case "address":
        if (!ValidationUtils.isValidAddress(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Address");
        }
        user.setAddress(value);
        break;
      case "city":
        if (!ValidationUtils.isValidCity(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid City Name");
        }
        user.setCity(value);
        break;
      case "state":
        if (!ValidationUtils.isValidUSState(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid US State");
        }
        user.setState(value);
        break;
      case "zipcode":
        if (!ValidationUtils.isValidZipCode(value)) {
          return UserMessage.INVALID_PARAMETER.withMessage("Invalid Zip Code");
        }
        user.setZipcode(value);
        break;
      default:
        return UserMessage.INVALID_PARAMETER;
    }
    //    userCollection.replaceOne(eq("username", user.getUsername()), user);
    userDao.update(user);
    return UserMessage.SUCCESS;
  }
}
