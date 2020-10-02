package Security;

import Config.Message;
import Config.Service;
import Database.TokenDao;
import Database.UserDao;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;

import java.util.Date;
import java.util.Objects;

public class TwoFactorAuthService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String token;

  public TwoFactorAuthService(MongoDatabase db, Logger logger, String username, String token) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.token = token;
  }

  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(username);
    Objects.requireNonNull(token);
    if (!ValidationUtils.isValidUsername(username)) {
      return UserMessage.INVALID_PARAMETER;
    }
    User user = UserDao.findOneUserOrNull(db, username);
    if (user == null) {
      return UserMessage.USER_NOT_FOUND;
    }
    Tokens tokens = TokenDao.getTokensOrNull(db, username);
    if (tokens == null) {
      return UserMessage.AUTH_FAILURE.withMessage("2fa token not found for user.");
    }
    String stored2faToken = tokens.getTwoFactorCode();
    Date stored2faExpiration = tokens.getTwoFactorExp();
    if (stored2faToken == null || stored2faExpiration == null) {
      return UserMessage.AUTH_FAILURE.withMessage("2fa token not found for user.");
    }
    // Check for expired reset link.
    long nowMillis = System.currentTimeMillis();
    Date now = new Date(nowMillis);
    if (stored2faExpiration.compareTo(now) < 0) {
      return UserMessage.AUTH_FAILURE.withMessage("2FA link expired.");
    }

    if (!stored2faToken.equals(token)) {
      return UserMessage.AUTH_FAILURE.withMessage("Invalid 2fa token.");
    }
    // Remove the token entry if its last remaining key is the 2fa token.
    // Remove only the password reset token if there are other fields.
    TokenDao.removeTokenIfLast(db, username, tokens, Tokens.TokenType.TWO_FACTOR);
    // Set Session token.
    ctx.sessionAttribute("privilegeLevel", user.getUserType());
    ctx.sessionAttribute("orgName", user.getOrganization());
    ctx.sessionAttribute("username", username);
    return UserMessage.AUTH_SUCCESS;
  };

  public UserType getUserType() {}
}
