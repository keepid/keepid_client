package EmailTest;

import Security.EmailExceptions;
import Security.EmailUtil;
import org.junit.jupiter.api.Test;

public class EmailUtilTest {

  private EmailUtil emailUtil = new EmailUtil();

  @Test
  public void checkOrgInvite() {
    try {
      String actual = emailUtil.getOrganizationInviteEmail("ji", "Cat", "Kap");
      System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }

  @Test
  public void checkVeriCode() {
    try {
      String actual = emailUtil.getVerificationCodeEmail("hiii");
      System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }

  @Test
  public void checkReset() {
    try {
      String actual = emailUtil.getPasswordResetEmail("hiii");
      System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }
}
