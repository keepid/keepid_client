package ActivityTest;

import Activity.Activity;
import Activity.CreateUserActivity;
import Activity.PasswordRecoveryActivity;
import org.junit.Test;

public class ActivityUnitTest {
  @Test
  public void unit() {
    Activity act = new CreateUserActivity();
    //    assert (act.getType().size() == 2);
    System.out.print(PasswordRecoveryActivity.class.getSimpleName());
  }
}
