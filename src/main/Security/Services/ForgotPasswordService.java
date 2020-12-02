package Security.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import Security.EmailExceptions;
import Security.EmailUtil;
import Security.SecurityUtils;
import Security.Tokens;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import org.slf4j.Logger;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class ForgotPasswordService implements Service {

  MongoDatabase db;
  Logger logger;
  private String username;
  public static final int EXPIRATION_TIME_2_HOURS = 7200000;

  public ForgotPasswordService(MongoDatabase db, Logger logger, String username) {
    this.db = db;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(username);
    if (!ValidationUtils.isValidUsername(username)) {
      return UserMessage.INVALID_PARAMETER;
    }
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }
    String emailAddress = user.getEmail();
    if (emailAddress == null) {
      return UserMessage.EMAIL_DOES_NOT_EXIST;
    }
    String id = SecurityUtils.generateRandomStringId();
    String jwt =
        SecurityUtils.createJWT(
            id, "KeepID", username, "Password Reset Confirmation", EXPIRATION_TIME_2_HOURS);
    MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
    tokenCollection.replaceOne(
        eq("username", username),
        new Tokens().setUsername(username).setResetJwt(jwt),
        new ReplaceOptions().upsert(true));
    try {
      String emailJWT = EmailUtil.getPasswordResetEmail("https://keep.id/reset-password/" + jwt);
      EmailUtil.sendEmail("Keep Id", emailAddress, "Password Reset Confirmation", emailJWT);
    } catch (EmailExceptions e) {
      return e;
    }
    return UserMessage.SUCCESS;
  }
}
