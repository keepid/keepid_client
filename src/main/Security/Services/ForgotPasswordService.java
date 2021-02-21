package Security.Services;

import Config.Message;
import Config.Service;
import Database.Token.TokenDao;
import Database.User.UserDao;
import Security.EmailExceptions;
import Security.EmailUtil;
import Security.SecurityUtils;
import Security.Tokens;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;

import java.util.Objects;
import java.util.Optional;

public class ForgotPasswordService implements Service {

  UserDao userDao;
  TokenDao tokenDao;
  private String username;
  public static final int EXPIRATION_TIME_2_HOURS = 7200000;

  public ForgotPasswordService(UserDao userDao, TokenDao tokenDao, String username) {
    this.userDao = userDao;
    this.tokenDao = tokenDao;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(username);
    if (!ValidationUtils.isValidUsername(username)) {
      return UserMessage.INVALID_PARAMETER;
    }
    Optional<User> userResult = userDao.get(username);
    if (userResult.isEmpty()) {
      return UserMessage.USER_NOT_FOUND;
    }
    User user = userResult.get();
    String emailAddress = user.getEmail();
    if (emailAddress == null) {
      return UserMessage.EMAIL_DOES_NOT_EXIST;
    }
    String id = SecurityUtils.generateRandomStringId();
    String jwt =
        SecurityUtils.createJWT(
            id, "KeepID", username, "Password Reset Confirmation", EXPIRATION_TIME_2_HOURS);
    Tokens newToken = new Tokens().setUsername(username).setResetJwt(jwt);
    tokenDao.replaceOne(username, newToken);
    try {
      String emailJWT = EmailUtil.getPasswordResetEmail("https://keep.id/reset-password/" + jwt);
      EmailUtil.sendEmail("Keep Id", emailAddress, "Password Reset Confirmation", emailJWT);
    } catch (EmailExceptions e) {
      return e;
    }
    return UserMessage.SUCCESS;
  }
}
