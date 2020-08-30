package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.ArrayList;
import java.util.List;

public class CreateUserActivity extends Activity {

  @BsonProperty(value = "created")
  private User created;

  public CreateUserActivity() {}

  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(CreateUserActivity.class.getSimpleName());
    return a;
  }

  public CreateUserActivity(User user, User created) {
    super(user);
    this.created = created;
  }

  public User getCreated() {
    return created;
  }

  public void setCreated(User created) {
    this.created = created;
  }
}
