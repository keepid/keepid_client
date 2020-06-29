package ValidationTest;

import Validation.ValidationUtils;
import org.junit.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    assertTrue(ValidationUtils.isValidLastName("valid name here"));
    assertTrue(ValidationUtils.isValidLastName("Bob"));
    assertTrue(ValidationUtils.isValidLastName("O'Neal"));
    assertFalse(ValidationUtils.isValidLastName("invalid name 123"));
    assertFalse(ValidationUtils.isValidLastName("<script>hello</script>"));
    assertFalse(ValidationUtils.isValidLastName("    "));
    assertFalse(ValidationUtils.isValidLastName(""));
    assertFalse(ValidationUtils.isValidLastName(null));

    assertTrue(ValidationUtils.isValidOrgName("valid name here"));
    assertTrue(ValidationUtils.isValidOrgName("Bob"));
    assertTrue(ValidationUtils.isValidOrgName("O'Neal"));
    assertTrue(ValidationUtils.isValidOrgName("Valid name 123"));
    assertFalse(ValidationUtils.isValidOrgName("<script>hello</script>"));
    assertFalse(ValidationUtils.isValidOrgName("    "));
    assertFalse(ValidationUtils.isValidOrgName(""));
    assertFalse(ValidationUtils.isValidOrgName(null));
  }

  @Test
  public void validWebsite() {
    assertTrue(ValidationUtils.isValidOrgWebsite("https://example.com"));
    assertTrue(ValidationUtils.isValidOrgWebsite("https://www.example.com"));
    assertTrue(ValidationUtils.isValidOrgWebsite("https://www.example.org/somethinghere"));
    assertFalse(ValidationUtils.isValidOrgWebsite(""));
    assertFalse(ValidationUtils.isValidOrgWebsite("not_localhost"));
    assertFalse(ValidationUtils.isValidOrgWebsite("not a website"));
    assertFalse(ValidationUtils.isValidOrgWebsite("111.22.1.2"));
    assertFalse(ValidationUtils.isValidOrgWebsite("    "));
    assertFalse(ValidationUtils.isValidOrgWebsite(null));
  }

  @Test
  public void EINTest() {
    assertTrue(ValidationUtils.isValidEIN("12-1234567"));
    assertTrue(ValidationUtils.isValidEIN("42-1231244"));
    assertTrue(ValidationUtils.isValidEIN("561234567"));
    assertFalse(ValidationUtils.isValidEIN("1-1232345"));
    assertFalse(ValidationUtils.isValidEIN(null));
    assertFalse(ValidationUtils.isValidEIN("12-1"));
    assertFalse(ValidationUtils.isValidEIN(" "));
    assertFalse(ValidationUtils.isValidEIN("794-35344534"));
    assertFalse(ValidationUtils.isValidEIN("jsa"));
  }

  @Test
  public void emailTest() {
    assertTrue(ValidationUtils.isValidEmail("myemail@email.com"));
    assertTrue(ValidationUtils.isValidEmail("anotherExample@gmail.com"));
    assertTrue(ValidationUtils.isValidEmail("12345@email.org"));
    assertFalse(ValidationUtils.isValidEmail("<script>"));
    assertFalse(ValidationUtils.isValidEmail("notValidEmail.org"));
    assertFalse(ValidationUtils.isValidEmail("email@"));
    assertFalse(ValidationUtils.isValidEmail("    "));
    assertFalse(ValidationUtils.isValidEmail(""));
    assertFalse(ValidationUtils.isValidEmail(null));
  }

  @Test
  public void phoneNumberTest() {
    assertTrue(ValidationUtils.isValidPhoneNumber("6305264087"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(630)111-1111"));
    assertTrue(ValidationUtils.isValidPhoneNumber("123-456-7890"));
    assertTrue(ValidationUtils.isValidPhoneNumber("1-630-526-4047"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(1)-(410)-302-2342"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(267)-234-2342"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(123)456-7890"));
    assertTrue(ValidationUtils.isValidPhoneNumber("(123)4567890"));
    assertFalse(ValidationUtils.isValidPhoneNumber("notValidPhoneNumber"));
    assertFalse(ValidationUtils.isValidPhoneNumber("222222222222222222"));
    assertFalse(ValidationUtils.isValidPhoneNumber("222"));
    assertFalse(ValidationUtils.isValidPhoneNumber("    "));
    assertFalse(ValidationUtils.isValidPhoneNumber(""));
    assertFalse(ValidationUtils.isValidPhoneNumber(null));
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
  public void USStateTest() {
    assertTrue(ValidationUtils.isValidUSState("IL"));
    assertTrue(ValidationUtils.isValidUSState("PA"));
    assertTrue(ValidationUtils.isValidUSState("MO"));
    assertTrue(ValidationUtils.isValidUSState("OR"));
    assertTrue(ValidationUtils.isValidUSState("WA"));
    assertFalse(ValidationUtils.isValidUSState("1-6789"));
    assertFalse(ValidationUtils.isValidUSState("XJ"));
    assertFalse(ValidationUtils.isValidUSState("<script>"));
    assertFalse(ValidationUtils.isValidUSState("    "));
    assertFalse(ValidationUtils.isValidUSState(""));
    assertFalse(ValidationUtils.isValidUSState(null));
  }

  @Test
  public void cityTest() {
    assertTrue(ValidationUtils.isValidCity("Philadelphia"));
    assertTrue(ValidationUtils.isValidCity("Chicago"));
    assertTrue(ValidationUtils.isValidCity("St. Paul - Minneapolis"));
    assertTrue(ValidationUtils.isValidCity("Bird - in - hand"));
    assertTrue(ValidationUtils.isValidCity("Cøpenhagen"));
    assertTrue(ValidationUtils.isValidCity("High."));
    assertFalse(ValidationUtils.isValidCity("123 street"));
    assertFalse(ValidationUtils.isValidCity(" "));
    assertFalse(ValidationUtils.isValidCity(null));
  }

  @Test
  public void streetAddressTest() {
    assertTrue(ValidationUtils.isValidAddress("Here"));
    assertTrue(ValidationUtils.isValidAddress("Baptist Church"));
    assertTrue(ValidationUtils.isValidAddress("123 Market, Apt. S3"));
    assertFalse(ValidationUtils.isValidAddress("#"));
    assertFalse(ValidationUtils.isValidAddress("Text #"));
    assertFalse(ValidationUtils.isValidAddress("123,   {"));
    assertFalse(ValidationUtils.isValidAddress("hullo#"));
    assertFalse(ValidationUtils.isValidAddress(" "));
    assertFalse(ValidationUtils.isValidAddress(null));
  }

  @Test
  public void birthDateTest() {
    assertTrue(ValidationUtils.isValidBirthDate("12-23-1234"));
    assertTrue(ValidationUtils.isValidBirthDate("03-23-2000"));
    assertTrue(ValidationUtils.isValidBirthDate("10-01-2019"));
    assertFalse(ValidationUtils.isValidBirthDate("10-01-2029"));
    assertFalse(ValidationUtils.isValidBirthDate("123-10-1010"));
    assertFalse(ValidationUtils.isValidBirthDate("12-123-1233"));
    assertFalse(ValidationUtils.isValidBirthDate("12-01-2012as"));
    assertFalse(ValidationUtils.isValidBirthDate("hullo"));
    assertFalse(ValidationUtils.isValidBirthDate(" "));
    assertFalse(ValidationUtils.isValidBirthDate(null));
  }

  @Test
  public void usernameTest() {
    assertTrue(ValidationUtils.isValidUsername("samuel"));
    assertTrue(ValidationUtils.isValidUsername("JoeHi"));
    assertTrue(ValidationUtils.isValidUsername("KAYLA-REMMINGTON12"));
    assertFalse(ValidationUtils.isValidUsername("/"));
    assertFalse(ValidationUtils.isValidUsername("S#Rena"));
    assertFalse(ValidationUtils.isValidUsername("123 Test"));
    assertFalse(ValidationUtils.isValidUsername("1234%"));
    assertFalse(ValidationUtils.isValidUsername(" "));
    assertFalse(ValidationUtils.isValidUsername(null));
  }

  @Test
  public void passwordTest() {
    assertTrue(ValidationUtils.isValidPassword("thispasswordissufficientlylong"));
    assertTrue(ValidationUtils.isValidPassword("12345678"));
    assertTrue(
        ValidationUtils.isValidPassword(
            "123Passwordasdkjfhasdkfhafhjask.dfjhasdfjlasdkjfhaslkdjfh*()"));
    assertFalse(ValidationUtils.isValidPassword("asd\\"));
    assertFalse(ValidationUtils.isValidPassword("asdkll/"));
    assertFalse(ValidationUtils.isValidPassword("aslf;"));
    assertFalse(
        ValidationUtils.isValidPassword(
            "thisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpasswordthisisareallylongpassword"));
    assertFalse(ValidationUtils.isValidPassword(" "));
    assertFalse(ValidationUtils.isValidPassword(null));
  }

  @Test
  public void objectIdTest() {
    assertTrue(ValidationUtils.isValidObjectId("507f191e810c19729de860ea"));
    assertTrue(ValidationUtils.isValidObjectId("507f1f77bcf86cd799439011"));
    assertFalse(ValidationUtils.isValidObjectId("asd\\"));
    assertFalse(
        ValidationUtils.isValidObjectId("507f1f77bcf86cd799439011507f1f77bcf86cd799439011"));
    assertFalse(ValidationUtils.isValidObjectId("this is not a valid object id"));
    assertFalse(ValidationUtils.isValidObjectId(" "));
    assertFalse(ValidationUtils.isValidObjectId(null));
  }
}
