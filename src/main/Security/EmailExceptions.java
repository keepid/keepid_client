package Security;

import org.json.JSONObject;

public class EmailExceptions extends Exception {

  private EmailMessages emailMessage;

  EmailExceptions(EmailMessages emailMessage) {
    this.emailMessage = emailMessage;
  }

  public String toString() {
    return emailMessage.toString();
  }

  public String getErrorName() {
    return this.emailMessage.getErrorName();
  }

  public String getErrorDescription() {
    return this.emailMessage.getErrorDescription();
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
