package Activity;

import User.User;

import java.util.ArrayList;
import java.util.List;

public class CreateDirectorActivity extends CreateUserActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(CreateUserActivity.class.getSimpleName());
    a.add(CreateDirectorActivity.class.getSimpleName());
    return a;
  }

  public CreateDirectorActivity() {
    super();
  }

  public CreateDirectorActivity(User owner, User created) {
    super(owner, created);
  }
}
