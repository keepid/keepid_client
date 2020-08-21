package Activity;

import User.User;

public class CreateDirectorActivity extends CreateUserActivity {
  public CreateDirectorActivity() {}

  public CreateDirectorActivity(User owner, String created) {
    super(owner, created);
  }
}
