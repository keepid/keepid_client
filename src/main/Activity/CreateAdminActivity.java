package Activity;

import User.User;

import java.util.ArrayList;
import java.util.List;

public class CreateAdminActivity extends CreateUserActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(CreateUserActivity.class.getSimpleName());
    a.add(CreateAdminActivity.class.getSimpleName());
    return a;
  }

  public CreateAdminActivity() {
    super();
  }

  public CreateAdminActivity(User owner, User created) {
    super(owner, created);
  }
}
