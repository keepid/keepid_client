package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.ArrayList;
import java.util.List;

public class LoginActivity extends AuthenticateActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(AuthenticateActivity.class.getSimpleName());
    a.add(LoginActivity.class.getSimpleName());
    return a;
  }

  @BsonProperty(value = "isTwoFactor")
  private boolean isTwoFactor;

  public LoginActivity() {}

  public LoginActivity(User user, Boolean isTwoFactor) {
    super(user);
    this.isTwoFactor = isTwoFactor;
  }

  public boolean isTwoFactor() {
    return isTwoFactor;
  }

  public void setTwoFactor(boolean twoFactor) {
    isTwoFactor = twoFactor;
  }
}
