package Activity;

import User.User;

public class ChangeUserAttributesActivity extends UserActivity {
  private String attributeName;
  private String oldAttributeValue;
  private String newAttributeValue;

  public ChangeUserAttributesActivity() {}

  public ChangeUserAttributesActivity(User user) {
    super(user);
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
