package Activity;

import User.User;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.ArrayList;
import java.util.List;

public class ChangeUserAttributesActivity extends UserActivity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(UserActivity.class.getSimpleName());
    a.add(ChangeUserAttributesActivity.class.getSimpleName());
    return a;
  }

  @BsonProperty(value = "attributeName")
  private String attributeName;

  @BsonProperty(value = "oldAttributeValue")
  private String oldAttributeValue;

  @BsonProperty(value = "newAttributeValue")
  private String newAttributeValue;

  public ChangeUserAttributesActivity() {}

  public ChangeUserAttributesActivity(
      User user, String attributeName, String oldAttributeValue, String newAttributeValue) {
    super(user);
    this.attributeName = attributeName;
    this.oldAttributeValue = oldAttributeValue;
    this.newAttributeValue = newAttributeValue;
  }

  public String getAttributeName() {
    return attributeName;
  }

  public void setAttributeName(String attributeName) {
    this.attributeName = attributeName;
  }

  public String getOldAttributeValue() {
    return oldAttributeValue;
  }

  public void setOldAttributeValue(String oldAttributeValue) {
    this.oldAttributeValue = oldAttributeValue;
  }

  public String getNewAttributeValue() {
    return newAttributeValue;
  }

  public void setNewAttributeValue(String newAttributeValue) {
    this.newAttributeValue = newAttributeValue;
  }
}
