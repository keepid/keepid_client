package Activity;

import User.User;

public class CreateClientActivity extends CreateUserActivity {
  private User creator;

  public CreateClientActivity() {}

  public CreateClientActivity(User owner, String created) {
    super(owner, created);
  }

  public User getCreator() {
    return creator;
  }

  public void setCreator(User creator) {
    this.creator = creator;
  }
}
