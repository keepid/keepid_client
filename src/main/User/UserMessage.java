package User;

import org.json.JSONObject;

public enum UserMessage {
  AUTH_SUCCESS("AUTH_SUCCESS:Successfully Authenticated User"),
  ENROLL_SUCCESS("ENROLL_SUCCESS:Successfully enrolled User."),
  AUTH_FAILURE("AUTH_FAILURE:Wrong Credentials"),
  HASH_FAILURE("HASH_FAILURE:Check Argon2 documentation"),
  USER_NOT_FOUND("USER_NOT_FOUND:User does not exist in database."),
  SESSION_TOKEN_FAILURE("SESSION_TOKEN_FAILURE:Session tokens are incorrect."),
  NONADMIN_ENROLL_ADMIN("NONADMIN_ENROLL_ADMIN:A Non-Admin cannot enroll an admin."),
  NONADMIN_ENROLL_WORKER("NONADMIN_ENROLL_WORKER:A non-admin cannot enroll a worker."),
  CLIENT_ENROLL_CLIENT("CLIENT_ENROLL_CLIENT:Only workers or admins can enroll new clients."),
  INVALID_PARAMETER("INVALID_PARAMETER:Please check your parameter"),
  USERNAME_ALREADY_EXISTS("USERNAME_ALREADY_EXISTS:This username is taken."),
  SERVER_ERROR("SERVER_ERROR:There was an error with the server."),
  INSUFFICIENT_PRIVILEGE("INSUFFICIENT_PRIVILEGE:Privilege level too low."),
  SUCCESS("SUCCESS:Success.");

  public String errorMessage;

  UserMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public String toString() {
    return this.errorMessage;
  }

  public String getErrorName() {
    return this.errorMessage.split(":")[0];
  }

  public String getErrorDescription() {
    return this.errorMessage.split(":")[1];
  }

  public String toJSON() {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", getErrorDescription());
    return res.toString();
  }

  public String toJSON(String message) {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", message);
    return res.toString();
  }
}
