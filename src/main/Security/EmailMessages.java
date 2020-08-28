package Security;

import org.json.JSONObject;

public enum EmailMessages {
  EMAIL_DOM_NOT_FOUND("EMAIL_DOM_NOT_FOUND: Can't locate target email in html"),
  HTML_NOT_FOUND("HTML_NOT_FOUND: Can't locate html needed for email"),
  RECEIVER_DOM_NOT_FOUND("RECEIVER_DOM_NOT_FOUND: Can't locate target name in html"),
  INVITER_DOM_NOT_FOUND("INVITER_DOM_NOT_FOUND: Can't locate sender name in html"),
  CODE_DOM_NOT_FOUND("CODE_DOM_NOT_FOUND: Can't locate verification code in html"),
  NOT_VALID_EMAIL("NOT_VALID_EMAIL: The email address isn't valid"),
  SUCCESS("SUCCESS:Success.");

  private String errorMessage;

  EmailMessages(String errorMessage) {
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
