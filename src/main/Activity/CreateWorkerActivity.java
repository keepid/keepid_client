package Activity;

import User.User;

import java.util.ArrayList;
import java.util.List;

public class CreateWorkerActivity extends CreateUserActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(CreateUserActivity.class.getSimpleName());
    a.add(CreateWorkerActivity.class.getSimpleName());
    return a;
  }

  private User creator;

  public CreateWorkerActivity() {
    super();
  }

  public CreateWorkerActivity(User owner, User created) {
    super(owner, created);
  }

  public User getCreator() {
    return creator;
  }

  public void setCreator(User creator) {
    this.creator = creator;
  }
}
