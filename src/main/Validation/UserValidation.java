package Validation;

import Logger.LogFactory;
import UserTest.UserMessage;
import io.javalin.http.Context;
import org.json.JSONObject;
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

    JSONObject errorJSON = new JSONObject(); // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("UserValidation");

    if (!ValidationUtils.isValidFirstName(firstName)) {
      logger.error("Invalid firstName: " + firstName);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid First Name");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      logger.error("Invalid lastName: " + lastName);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Last Name");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidBirthDate(birthDate)) {
      logger.error("Invalid birthDate: " + birthDate);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Birth Date");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(phone)) {
      logger.error("Invalid orgContactPhoneNumber: " + phone);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Phone");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidEmail(email)) {
      logger.error("Invalid email: " + email);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Email");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidAddress(address)) {
      logger.error("Invalid address: " + address);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Address");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidCity(city)) {
      logger.error("Invalid city: " + city);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid City");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidUSState(state)) {
      logger.error("Invalid state: " + state);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid State");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidZipCode(zipcode)) {
      logger.error("Invalid zipcode: " + zipcode);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Zipcode");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidUsername(username)) {
      logger.error("Invalid username: " + username);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Username");
      ctx.json(errorJSON);
      return false;
    }
    if (!ValidationUtils.isValidPassword(password)) {
      logger.error("Invalid password: " + password);
      errorJSON.put("status", UserMessage.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Password");
      ctx.json(errorJSON);
      return false;
    }
    return true;
  }
}
