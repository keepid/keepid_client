package EmailTest;

import Security.EmailExceptions;
import Security.EmailUtil;
import org.junit.jupiter.api.Test;

import static org.junit.Assert.assertEquals;

public class EmailUtilTest {

  private EmailUtil emailUtil = new EmailUtil();

  @Test
  public void checkOrgInvite() {
    try {
      String actual = emailUtil.getOrganizationInviteEmail("ji", "Cat", "Kap");
      // System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }

  @Test
  public void checkVeriCode() {
    try {
      String actual = emailUtil.getVerificationCodeEmail("hiii");
      // System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }

  @Test
  public void checkReset() {
    try {
      String actual = emailUtil.getPasswordResetEmail("hiii");
      // System.out.println(actual);
    } catch (EmailExceptions e) {
      System.out.print(e.toString());
    }
  }

  @Test
  public void testValidEmail() {
    try {
      String actual = emailUtil.getPasswordResetEmail("hiii");
      // I commented it out as I had to deploy .env file for this to run successfully. There's no
      // need to do so remotely
      // If you wish to test such exception, add .env file in the configuration.
      // emailUtil.sendEmail("h", "fefefwfw", "MY", actual);
    } catch (EmailExceptions e) {
      assertEquals(e.toString(), "NOT_VALID_EMAIL: The email address isn't valid");
      //    } catch (UnsupportedEncodingException e) {
      //      Assert.assertFalse(true);
    }
  }
}
