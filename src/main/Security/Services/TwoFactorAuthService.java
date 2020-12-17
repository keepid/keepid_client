package Security.Services;

import Config.Message;
import Config.Service;
import Database.Token.TokenDao;
import Database.User.UserDao;
import Security.Tokens;
import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationUtils;
import org.slf4j.Logger;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;

public class TwoFactorAuthService implements Service {
  UserDao userDao;
  TokenDao tokenDao;
  Logger logger;
  private String username;
  private String token;
  private UserType userType;
  private String orgName;

  public TwoFactorAuthService(
      UserDao userDao, TokenDao tokenDao, Logger logger, String username, String token) {
    this.userDao = userDao;
    this.tokenDao = tokenDao;
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
    Optional<User> userResult = userDao.get(username);
    if (userResult.isEmpty()) {
      return UserMessage.USER_NOT_FOUND;
    }
    User user = userResult.get();
    Optional<Tokens> result = tokenDao.get(username);
    if (result.isEmpty()) {
      return UserMessage.AUTH_FAILURE.withMessage("2fa token not found for user.");
    }
    Tokens tokens = result.get();
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
    tokenDao.removeTokenIfLast(username, tokens, Tokens.TokenType.TWO_FACTOR);
    // Set Session token.
    //    ctx.sessionAttribute("privilegeLevel", user.getUserType());
    //    ctx.sessionAttribute("orgName", user.getOrganization());
    //    ctx.sessionAttribute("username", username);
    this.userType = user.getUserType();
    this.orgName = user.getOrganization();
    return UserMessage.AUTH_SUCCESS;
  }
  ;

  public UserType getUserType() {
    return this.userType;
  }

  public String getUsername() {
    return username;
  }

  public String getOrgName() {
    return orgName;
  }
}
