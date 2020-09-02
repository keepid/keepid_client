package User;

import Config.Message;
import org.json.JSONObject;

public enum UserValidationMessage implements Message {
  INVALID_FIRSTNAME,
  INVALID_LASTNAME,
  INVALID_BIRTHDATE,
  INVALID_EMAIL,
  INVALID_PHONENUMBER,
  INVALID_ORGANIZATION,
  INVALID_ADDRESS,
  INVALID_CITY,
  INVALID_STATE,
  INVALID_ZIPCODE,
  INVALID_USERNAME,
  INVALID_PASSWORD,
  INVALID_USERTYPE,
  VALID;

  public static JSONObject toUserMessageJSON(UserValidationMessage v) {
    switch (v) {
      case INVALID_FIRSTNAME:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid First Name");
      case INVALID_LASTNAME:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Last Name");
      case INVALID_BIRTHDATE:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Birth Date");
      case INVALID_EMAIL:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Email");
      case INVALID_PHONENUMBER:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Phone");
      case INVALID_ORGANIZATION:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Organization");
      case INVALID_ADDRESS:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Address");
      case INVALID_CITY:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid City");
      case INVALID_STATE:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid State");
      case INVALID_ZIPCODE:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Zipcode");
      case INVALID_USERNAME:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Username");
      case INVALID_PASSWORD:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid Password");
      case INVALID_USERTYPE:
        return UserMessage.INVALID_PARAMETER.toJSON("Invalid UserType");
      case VALID:
        return UserMessage.SUCCESS.toJSON();
      default:
        return UserMessage.INVALID_PARAMETER.toJSON();
    }
  }

  @Override
  public JSONObject toJSON() {
    return null;
  }

  @Override
  public JSONObject toJSON(String message) {
    return null;
  }

  @Override
  public String getErrorName() {
    return null;
  }

  @Override
  public String getErrorDescription() {
    return null;
  }
}
