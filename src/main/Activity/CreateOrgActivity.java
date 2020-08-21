package Activity;

import Organization.Organization;
import User.User;

public class CreateOrgActivity extends Activity {
  private Organization org;

  public CreateOrgActivity() {}

  public CreateOrgActivity(User owner) {
    super(owner);
  }

  public Organization getOrg() {
    return org;
  }

  public void setOrg(Organization org) {
    this.org = org;
  }
}
