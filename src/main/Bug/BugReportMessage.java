package Bug;

import org.json.JSONObject;

public enum BugReportMessage {
  SLACK_FAILED("SLACK_FAILED: Failed notify the team. Email contact@keep.id for further help"),
  SUCCESS("SUCCESS:Your report is submitted!"),
  NO_TITLE("NO_TITLE:Your message has no title");
  private String errorMessage;

  BugReportMessage(String errorMessage) {
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
