package Validation;

import Logger.LogFactory;
import User.User;
import User.UserMessage;
import org.slf4j.Logger;

import java.io.IOException;

public class UserValidation implements GeneralValidator {

  public static boolean isValid(User user) throws SecurityException, IOException {

    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("UserValidation");

    if (!ValidationUtils.isValidFirstName(user.firstName)) {
      logger.error("Invalid firstName: " + user.firstName);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid First Name"));
      return false;
    }
    if (!ValidationUtils.isValidLastName(user.lastName)) {
      logger.error("Invalid lastName: " + user.lastName);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Last Name"));
      return false;
    }
    if (!ValidationUtils.isValidBirthDate(user.birthDate)) {
      logger.error("Invalid birthDate: " + user.birthDate);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date"));
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(user.phone)) {
      logger.error("Invalid orgContactPhoneNumber: " + user.phone);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Phone"));
      return false;
    }
    if (!ValidationUtils.isValidEmail(user.email)) {
      logger.error("Invalid email: " + user.email);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Email"));
      return false;
    }
    if (!ValidationUtils.isValidAddress(user.address)) {
      logger.error("Invalid address: " + user.address);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Address"));
      return false;
    }
    if (!ValidationUtils.isValidCity(user.city)) {
      logger.error("Invalid city: " + user.city);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid City"));
      return false;
    }
    if (!ValidationUtils.isValidUSState(user.state)) {
      logger.error("Invalid state: " + user.state);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid State"));
      return false;
    }
    if (!ValidationUtils.isValidZipCode(user.zipcode)) {
      logger.error("Invalid zipcode: " + user.zipcode);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Zipcode"));
      return false;
    }
    if (!ValidationUtils.isValidUsername(user.username)) {
      logger.error("Invalid username: " + user.username);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Username"));
      return false;
    }
    if (!ValidationUtils.isValidPassword(user.password)) {
      logger.error("Invalid password: " + user.password);
      user.ctx.json(UserMessage.INVALID_PARAMETER.toJSON("Invalid Password"));
      return false;
    }
    return true;
  }
}
