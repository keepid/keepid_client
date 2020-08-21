package Activity;

import User.User;

public class LoginActivity extends AuthenticateActivity {
  private boolean isTwoFactor;

  public LoginActivity() {}

  public LoginActivity(User user) {
    super(user);
  }

  public boolean isTwoFactor() {
    return isTwoFactor;
  }

  public void setTwoFactor(boolean twoFactor) {
    isTwoFactor = twoFactor;
  }
}
