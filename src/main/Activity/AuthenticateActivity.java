package Activity;

import User.User;

import java.util.ArrayList;
import java.util.List;

public class AuthenticateActivity extends UserActivity {
  public AuthenticateActivity() {}

  public AuthenticateActivity(User user) {
    super(user);
  }

  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(AuthenticateActivity.class.getSimpleName());
    return a;
  }
}
