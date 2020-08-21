package Activity;

import User.User;

public class PasswordRecoveryActivity extends AuthenticateActivity {
  private String oldPasswordHash;
  private String newPasswordHash;
  private String recoveryEmail;

  public PasswordRecoveryActivity() {}

  public PasswordRecoveryActivity(User user) {
    super(user);
  }

  public String getOldPasswordHash() {
    return oldPasswordHash;
  }

  public void setOldPasswordHash(String oldPasswordHash) {
    this.oldPasswordHash = oldPasswordHash;
  }

  public String getNewPasswordHash() {
    return newPasswordHash;
  }

  public void setNewPasswordHash(String newPasswordHash) {
    this.newPasswordHash = newPasswordHash;
  }

  public String getRecoveryEmail() {
    return recoveryEmail;
  }

  public void setRecoveryEmail(String recoveryEmail) {
    this.recoveryEmail = recoveryEmail;
  }
}
