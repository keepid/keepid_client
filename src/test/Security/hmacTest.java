package Security;

import org.junit.Test;

import java.security.GeneralSecurityException;

public class hmacTest {

  @Test
  public void hashString() throws GeneralSecurityException {
    SecurityUtils securityUtils = new SecurityUtils();
    System.out.println(securityUtils.hashString("Hello World"));
  }
}
