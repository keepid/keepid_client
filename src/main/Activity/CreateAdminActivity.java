package Activity;

import User.User;

public class CreateAdminActivity extends CreateUserActivity {

  public CreateAdminActivity() {}

  public CreateAdminActivity(User owner, String created) {
    super(owner, created);
  }
}
