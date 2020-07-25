package EmailTest;

import Security.EmailExceptions;
import Security.EmailUtil;
import org.junit.jupiter.api.Test;

public class OrganizationInviteTest {

  private EmailUtil emailUtil = new EmailUtil();

  @Test
  public void checkString() {
    try {
      String actual = emailUtil.getOrganizationInviteEmail("ji", "Cat", "Kap");
      System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }
}
