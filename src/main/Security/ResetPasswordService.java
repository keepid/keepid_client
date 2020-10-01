package Security;

import Activity.PasswordRecoveryActivity;
import Config.Message;
import Config.Service;
import Database.TokenDao;
import Database.UserDao;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;

import java.util.Date;

public class ResetPasswordService implements Service {
  MongoDatabase db;
  Logger logger;
  private String jwt;
  private String newPassword;

  public ResetPasswordService(MongoDatabase db, Logger logger, String jwt, String newPassword) {
    this.db = db;
    this.logger = logger;
    this.jwt = jwt;
    this.newPassword = newPassword;
  }

  @Override
  public Message executeAndGetResponse() {
    // Decode the JWT. If invalid, return AUTH_FAILURE.
    if (!ValidationUtils.isValidPassword(newPassword)) {
      return UserMessage.INVALID_PARAMETER.withMessage("Invalid Password");
    }
    Claims claim;
    try {
      claim = SecurityUtils.decodeJWT(jwt);
    } catch (Exception e) {
      return UserMessage.AUTH_FAILURE.withMessage("Invalid reset link.");
    }

    String username = claim.getAudience();
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }
    long nowMillis = System.currentTimeMillis();
    Date now = new Date(nowMillis);
    if (claim.getExpiration().compareTo(now) < 0) {
      return UserMessage.AUTH_FAILURE.withMessage("Reset link expired.");
    }
    // Check if reset token exists.
    Tokens tokens = TokenDao.getTokensOrNull(db, username);
    if (tokens == null) {
      return UserMessage.AUTH_FAILURE.withMessage("Reset token not found for user.");
    }
    String storedJWT = tokens.getResetJwt();
    if (storedJWT == null) {
      return UserMessage.AUTH_FAILURE.withMessage("Reset token not found for user.");
    }
    if (!storedJWT.equals(jwt)) {
      return UserMessage.AUTH_FAILURE.withMessage("Invalid reset token.");
    }
    TokenDao.removeTokenIfLast(db, username, tokens, Tokens.TokenType.PASSWORD_RESET);
    UserDao.resetPassword(db, user, newPassword, PasswordRecoveryActivity.class.getSimpleName());
    return UserMessage.SUCCESS;
  }
}
