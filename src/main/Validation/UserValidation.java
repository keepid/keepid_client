package Validation;

import Logger.LogFactory;
import UserTest.UserMessage;
import io.javalin.http.Context;
import org.slf4j.Logger;

import java.io.IOException;

public class UserValidation implements GeneralValidator {

  public static boolean isValid(
      String firstName,
      String lastName,
      String birthDate,
      String email,
      String phone,
      String address,
      String city,
      String state,
      String zipcode,
      String username,
      String password,
      Context ctx)
      throws SecurityException, IOException {

    // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("UserValidation");

    if (!ValidationUtils.isValidFirstName(firstName)) {
      logger.error("Invalid firstName: " + firstName);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid First Name"));
      return false;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      logger.error("Invalid lastName: " + lastName);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Last Name"));
      return false;
    }
    if (!ValidationUtils.isValidBirthDate(birthDate)) {
      logger.error("Invalid birthDate: " + birthDate);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date"));
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(phone)) {
      logger.error("Invalid orgContactPhoneNumber: " + phone);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Phone"));
      return false;
    }
    if (!ValidationUtils.isValidEmail(email)) {
      logger.error("Invalid email: " + email);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Email"));
      return false;
    }
    if (!ValidationUtils.isValidAddress(address)) {
      logger.error("Invalid address: " + address);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Address"));
      return false;
    }
    if (!ValidationUtils.isValidCity(city)) {
      logger.error("Invalid city: " + city);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid City"));
      return false;
    }
    if (!ValidationUtils.isValidUSState(state)) {
      logger.error("Invalid state: " + state);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid State"));
      return false;
    }
    if (!ValidationUtils.isValidZipCode(zipcode)) {
      logger.error("Invalid zipcode: " + zipcode);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Zipcode"));
      return false;
    }
    if (!ValidationUtils.isValidUsername(username)) {
      logger.error("Invalid username: " + username);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Username"));
      return false;
    }
    if (!ValidationUtils.isValidPassword(password)) {
      logger.error("Invalid password: " + password);
      ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Password"));
      return false;
    }
    return true;
  }
}
