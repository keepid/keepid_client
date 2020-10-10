package Validation;

import User.UserType;
import org.bson.types.ObjectId;

import java.net.URL;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ValidationUtils {
  public static final int MIN_PASSWORD_LENGTH = 8;
  public static final int MAX_PASSWORD_LENGTH = 128;

  // Make Own Regex
  public static boolean isValidOrgName(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.streetPattern.matcher(input).matches();
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

  public static boolean isValidEIN(String input) {

    return input != null
        && !input.strip().isBlank()
        && ValRegex.orgEINPattern.matcher(input).matches();
  }

  public static boolean isValidEmail(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.emailPattern.matcher(input).matches();
  }

  public static boolean isValidPhoneNumber(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.phoneNumberPattern.matcher(input).matches();
  }

  public static boolean isValidOrganizationName(String input) {
    return input != null && !input.strip().isBlank();
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

  public static boolean isValidAddress(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.streetPattern.matcher(input).matches();
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

  public static boolean isValidBirthDate(String input) {
    if (input == null
        || input.strip().isBlank()
        || !ValRegex.birthDatePattern.matcher(input).matches()) {
      return false;
    }
    DateFormat dateFormat = new SimpleDateFormat("MM-dd-yyyy");
    try {
      dateFormat.setLenient(false);
      Date date = dateFormat.parse(input);
      return date.before(new Date());
    } catch (ParseException e) {
      return false;
    }
  }

  public static boolean isValidObjectId(String input) {
    if (input == null || input.strip().isBlank()) {
      return false;
    } else {
      try {
        ObjectId id = new ObjectId(input);
        return id.toString().equals(input);
      } catch (Exception e) {
        return false;
      }
    }
  }

  public static boolean isValidUsername(String input) {
    return input != null
        && !input.strip().isBlank()
        && ValRegex.usernamePattern.matcher(input).matches();
  }

  public static boolean isValidPassword(String input) {
    return (input != null
        && !input.strip().isBlank()
        && input.length() >= MIN_PASSWORD_LENGTH
        && input.length() < MAX_PASSWORD_LENGTH);
  }

  public static boolean isValidUserType(String userType) {
    return UserType.userTypeFromString(userType) != null;
  }
}
