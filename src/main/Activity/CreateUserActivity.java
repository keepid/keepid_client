package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;

public class CreateUserActivity extends Activity {

  @BsonProperty(value = "created")
  private String created;

  public CreateUserActivity() {}

  public CreateUserActivity(User user, String created) {
    super(user);
    this.created = created;
  }

  public String getCreated() {
    return created;
  }

  public void setCreated(String created) {
    this.created = created;
  }
}
