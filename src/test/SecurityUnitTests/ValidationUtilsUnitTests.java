package SecurityUnitTests;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import Security.ValidationUtils;
import org.junit.Test;

public class ValidationUtilsUnitTests {

  @Test
  public void nameTest() {
    assertTrue(ValidationUtils.isValidFirstName("valid name here"));
    assertTrue(ValidationUtils.isValidFirstName("Bob"));
    assertTrue(ValidationUtils.isValidFirstName("O'Neal"));
    assertFalse(ValidationUtils.isValidFirstName("invalid name 123"));
    assertFalse(ValidationUtils.isValidFirstName("<script>hello</script>"));
    assertFalse(ValidationUtils.isValidFirstName("    "));
    assertFalse(ValidationUtils.isValidFirstName(""));
    assertFalse(ValidationUtils.isValidFirstName(null));
  }

  @Test
  public void zipCodeTest() {
    assertTrue(ValidationUtils.isValidZipCode("60563"));
    assertTrue(ValidationUtils.isValidZipCode("19104"));
    assertTrue(ValidationUtils.isValidZipCode("12345-6789"));
    assertFalse(ValidationUtils.isValidZipCode("1-6789"));
    assertFalse(ValidationUtils.isValidZipCode("hello"));
    assertFalse(ValidationUtils.isValidZipCode("<script>"));
    assertFalse(ValidationUtils.isValidZipCode("    "));
    assertFalse(ValidationUtils.isValidZipCode(""));
    assertFalse(ValidationUtils.isValidZipCode(null));
  }

  @Test
  public void emailTest() {
    assertTrue(ValidationUtils.isValidEmail("myemail@email.com"));
    assertTrue(ValidationUtils.isValidEmail("anotherExample@gmail.com"));
    assertTrue(ValidationUtils.isValidEmail("12345@email.org"));
    assertFalse(ValidationUtils.isValidEmail("<script>"));
    assertFalse(ValidationUtils.isValidEmail("notValidEmail.org"));
    assertFalse(ValidationUtils.isValidEmail("    "));
    assertFalse(ValidationUtils.isValidEmail(""));
    assertFalse(ValidationUtils.isValidEmail(null));
  }

  @Test
  public void phoneNumberTest() {
    assertTrue(ValidationUtils.isValidPhoneNumber("6305264087"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(630)111-1111"));
    assertTrue(ValidationUtils.isValidPhoneNumber("123-456-7890"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(123)456-7890"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(123)4567890"));
    assertFalse(ValidationUtils.isValidPhoneNumber("notValidPhoneNumber"));
    assertFalse(ValidationUtils.isValidPhoneNumber("222222222222222222"));
    assertFalse(ValidationUtils.isValidPhoneNumber("222"));
    assertFalse(ValidationUtils.isValidPhoneNumber("    "));
    assertFalse(ValidationUtils.isValidPhoneNumber(""));
    assertFalse(ValidationUtils.isValidPhoneNumber(null));
  }
}
