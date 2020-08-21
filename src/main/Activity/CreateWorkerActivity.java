package Activity;

import User.User;

public class CreateWorkerActivity extends CreateUserActivity {
  private User creator;

  public CreateWorkerActivity() {}

  public CreateWorkerActivity(User owner, String created) {
    super(owner, created);
  }

  public User getCreator() {
    return creator;
  }

  public void setCreator(User creator) {
    this.creator = creator;
  }
}
