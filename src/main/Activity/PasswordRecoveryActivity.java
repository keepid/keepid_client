package Activity;

import User.User;

import java.util.ArrayList;
import java.util.List;

public class PasswordRecoveryActivity extends AuthenticateActivity {
  private String oldPasswordHash;
  private String newPasswordHash;
  private String recoveryEmail;

  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(AuthenticateActivity.class.getSimpleName());
    a.add(PasswordRecoveryActivity.class.getSimpleName());
    return a;
  }

  public PasswordRecoveryActivity() {}

  public PasswordRecoveryActivity(
      User user, String oldPasswordHash, String newPasswordHash, String recoveryEmail) {
    super(user);
    this.oldPasswordHash = oldPasswordHash;
    this.newPasswordHash = newPasswordHash;
    this.recoveryEmail = recoveryEmail;
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
