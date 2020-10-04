package Security.Services;

import Activity.ActivityController;
import Activity.ChangeUserAttributesActivity;
import Config.Message;
import Config.Service;
import Database.UserDao;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.slf4j.Logger;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.*;

public class ChangeAccountSettingService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String password;
  private String key;
  private String value;

  public ChangeAccountSettingService(
      MongoDatabase db, Logger logger, String username, String password, String key, String value) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.password = password;
    this.key = key;
    this.value = value;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(db);
    Objects.requireNonNull(username);
    Objects.requireNonNull(password);
    Objects.requireNonNull(key);
    Objects.requireNonNull(value);
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }

    String hash = user.getPassword();
    SecurityUtils.PassHashEnum verifyStatus = SecurityUtils.verifyPassword(password, hash);
    if (verifyStatus == SecurityUtils.PassHashEnum.ERROR) {
      return UserMessage.SERVER_ERROR;
    }
    if (verifyStatus == SecurityUtils.PassHashEnum.FAILURE) {
      return UserMessage.AUTH_FAILURE;
    }
    MongoCollection userCollection = db.getCollection("user");
    Document d =
        (Document)
            userCollection
                .find(eq("username", username))
                .projection(fields(include(key), excludeId()))
                .first();
    String old = d.get(key).toString();
    ActivityController activityController = new ActivityController(db);
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
    userCollection.replaceOne(eq("username", user.getUsername()), user);
    return UserMessage.SUCCESS;
  }
}
