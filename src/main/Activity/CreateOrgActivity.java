package Activity;

import Organization.Organization;
import User.User;

import java.util.ArrayList;
import java.util.List;

public class CreateOrgActivity extends Activity {
  @Override
  List<String> construct() {
    List<String> a = new ArrayList<>();
    a.add(Activity.class.getSimpleName());
    a.add(CreateOrgActivity.class.getSimpleName());
    return a;
  }

  private Organization org;

  public CreateOrgActivity() {}

  public CreateOrgActivity(User owner, Organization org) {
    super(owner);
    this.org = org;
  }

  public Organization getOrg() {
    return org;
  }

  public void setOrg(Organization org) {
    this.org = org;
  }
}
