package Security;

import Config.Message;
import Logger.LogFactory;
import Security.Services.*;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;
import org.slf4j.Logger;

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
        TwoFactorAuthService twoFactorAuthService =
            new TwoFactorAuthService(db, logger, username, token);
        Message message = twoFactorAuthService.executeAndGetResponse();
        if (message == UserMessage.SUCCESS) {
          ctx.sessionAttribute("privilegeLevel", twoFactorAuthService.getUserType());
          ctx.sessionAttribute("orgName", twoFactorAuthService.getOrgName());
          ctx.sessionAttribute("username", twoFactorAuthService.getUsername());
        }
        ctx.result(message.toResponseString());
      };
}
