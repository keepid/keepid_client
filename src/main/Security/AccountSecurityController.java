package Security;

import Database.TokenDao;
import Database.UserDao;
import Logger.LogFactory;
import Security.Tokens.TokenType;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Date;

public class AccountSecurityController {
  private MongoDatabase db;
  private Logger logger;

  public AccountSecurityController(MongoDatabase db) {
    this.db = db;
    logger = (new LogFactory()).createLogger("AccountSecurityController");
  }

  public Handler forgotPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        ForgotPasswordService forgotPasswordService =
            new ForgotPasswordService(db, logger, username);
        ctx.result(forgotPasswordService.executeAndGetResponse().toResponseString());
      };

  // Changes the password of a logged in user.
  public Handler changePassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = ctx.sessionAttribute("username");
        String oldPassword = req.getString("oldPassword");
        String newPassword = req.getString("newPassword");
        ChangePasswordService changePasswordService =
            new ChangePasswordService(db, logger, username, oldPassword, newPassword);
        ctx.result(changePasswordService.executeAndGetResponse().toResponseString());
      };

  public Handler changeAccountSetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = ctx.sessionAttribute("username");
        String password = req.getString("password");
        String key = req.getString("key");
        String value = req.getString("value");
        ChangeAccountSettingService changeAccountSettingService =
            new ChangeAccountSettingService(db, logger, username, password, key, value);
        ctx.result(changeAccountSettingService.executeAndGetResponse().toResponseString());
      };

  public Handler change2FASetting =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        Boolean isTwoFactorOn = req.getBoolean("twoFactorOn");
        String username = ctx.sessionAttribute("username");
        Change2FAService change2FAService =
            new Change2FAService(db, logger, username, isTwoFactorOn);
        ctx.result(change2FAService.executeAndGetResponse().toResponseString());
      };

  public Handler resetPassword =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        // Decode the JWT. If invalid, return AUTH_FAILURE.
        String jwt = req.getString("jwt");
        String newPassword = req.getString("newPassword");
        ResetPasswordService resetPasswordService =
            new ResetPasswordService(db, logger, jwt, newPassword);
        ctx.result(resetPasswordService.executeAndGetResponse().toResponseString());
      };

  public Handler twoFactorAuth =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String username = req.getString("username");
        String token = req.getString("token");
        User user = UserDao.findOneUserOrNull(db, username);
        if (user == null) {
          ctx.json(UserMessage.USER_NOT_FOUND.toJSON().toString());
          return;
        }
        Tokens tokens = TokenDao.getTokensOrNull(db, username);
        if (tokens == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2fa token not found for user.").toString());
          return;
        }
        String stored2faToken = tokens.getTwoFactorCode();
        Date stored2faExpiration = tokens.getTwoFactorExp();
        if (stored2faToken == null || stored2faExpiration == null) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2fa token not found for user.").toString());
          return;
        }
        // Check for expired reset link.
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        if (stored2faExpiration.compareTo(now) < 0) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("2FA link expired.").toString());
          return;
        }

        if (!stored2faToken.equals(token)) {
          ctx.json(UserMessage.AUTH_FAILURE.toJSON("Invalid 2fa token.").toString());
          return;
        }
        // Remove the token entry if its last remaining key is the 2fa token.
        // Remove only the password reset token if there are other fields.
        TokenDao.removeTokenIfLast(db, username, tokens, TokenType.TWO_FACTOR);
        // Set Session token.
        ctx.sessionAttribute("privilegeLevel", user.getUserType());
        ctx.sessionAttribute("orgName", user.getOrganization());
        ctx.sessionAttribute("username", username);
        ctx.json(UserMessage.AUTH_SUCCESS.toJSON().toString());
      };
}
