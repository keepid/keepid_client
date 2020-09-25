package User;

import Config.Message;
import org.json.JSONObject;

public enum UserMessage implements Message {
  AUTH_SUCCESS("AUTH_SUCCESS:Successfully Authenticated User"),
  ENROLL_SUCCESS("ENROLL_SUCCESS:Successfully enrolled User."),
  AUTH_FAILURE("AUTH_FAILURE:Wrong Credentials"),
  HASH_FAILURE("HASH_FAILURE:Check Argon2 documentation"),
  USER_NOT_FOUND("USER_NOT_FOUND:User does not exist in database."),
  SESSION_TOKEN_FAILURE("SESSION_TOKEN_FAILURE:Session tokens are incorrect."),
  NONADMIN_ENROLL_ADMIN("NONADMIN_ENROLL_ADMIN:A Non-Admin cannot enroll an admin."),
  CLIENT_ENROLL_CLIENT("CLIENT_ENROLL_CLIENT:Only workers or admins can enroll new clients."),
  INVALID_PARAMETER("INVALID_PARAMETER:Please check your parameter"),
  USERNAME_ALREADY_EXISTS("USERNAME_ALREADY_EXISTS:This username is taken."),
  SERVER_ERROR("SERVER_ERROR:There was an error with the server."),
  INSUFFICIENT_PRIVILEGE("INSUFFICIENT_PRIVILEGE:Privilege level too low."),
  INVALID_PRIVILEGE_TYPE("INVALID_PRIVILEGE_TYPE:The privilege type is invalid"),
  SUCCESS("SUCCESS:Success."),
  TOKEN_ISSUED("TOKEN_ISSUED:Token issued."),
  EMPTY_FIELD("EMPTY_FIELD:Cannot be empty."),
  EMAIL_DOES_NOT_EXIST("EMAIL_DOES_NOT_EXIST:No email found for this user");

  private final String errorMessage;

  UserMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public String toResponseString() {
    return toJSON().toString();
  }

  public String getErrorName() {
    return this.errorMessage.split(":")[0];
  }

  public String getErrorDescription() {
    return this.errorMessage.split(":")[1];
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
}
