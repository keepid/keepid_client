package Security;

import java.net.URL;

public class ValidationUtils {

  public static boolean isValidOrgName(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.orgNamePattern.matcher(input).matches();
  }

  public static boolean isValidOrgWebsite(String input) {
    try {
      URL url = new URL(input);
      url.toURI();
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public static boolean isValidEmail(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.emailPattern.matcher(input).matches();
  }

  public static boolean isValidFirstName(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.namePattern.matcher(input).matches();
  }

  public static boolean isValidLastName(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.namePattern.matcher(input).matches();
  }

  public static boolean isValidZipCode(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.zipCodePattern.matcher(input).matches();
  }

  public static boolean isValidCity(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.cityPattern.matcher(input).matches();
  }

  public static boolean isValidUSState(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.usStatePattern.matcher(input).matches();
  }

  public static boolean isValidTaxCode(String input) {
    return input != null && !input.strip().isBlank();
  }

  public static boolean isValidNumUsers(String input) {
    try {
      Integer.parseInt(input);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public static boolean isValidPhoneNumber(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.phoneNumberPattern.matcher(input).matches();
  }

  public static boolean isValidAddress(String input) {
    return input != null && !input.strip().isBlank();
  }
}
