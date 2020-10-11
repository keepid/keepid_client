package User;

import Config.Message;
import org.json.JSONObject;

public enum UserValidationMessage implements Message {
  INVALID_FIRSTNAME("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_LASTNAME("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_BIRTHDATE("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_EMAIL("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_PHONENUMBER("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_ORGANIZATION("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_ADDRESS("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_CITY("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_STATE("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_ZIPCODE("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_USERNAME("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_PASSWORD("INVALID_FIRSTNAME:Invalid First Name"),
  INVALID_USERTYPE("INVALID_FIRSTNAME:Invalid First Name"),
  VALID("SUCCESS:Valid User");

  private final String errorMessage;

  UserValidationMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

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

  public String toResponseString() {
    return toJSON().toString();
  }

  public JSONObject toJSON() {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", getErrorDescription());
    return res;
  }

  public JSONObject toJSON(String message) {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", message);
    return res;
  }

  public String getErrorName() {
    return this.errorMessage.split(":")[0];
  }

  public String getErrorDescription() {
    return this.errorMessage.split(":")[1];
  }
}
