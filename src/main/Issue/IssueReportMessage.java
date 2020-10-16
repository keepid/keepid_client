package Issue;

import Config.Message;
import org.json.JSONObject;

public enum IssueReportMessage implements Message {
  SLACK_FAILED("SLACK_FAILED: Failed notify the team. Email contact@keep.id for further help"),
  SUCCESS("SUCCESS:Your report is submitted!"),
  EMPTY_FIELD("EMPTY_FIELD:Your issue report needs a title"),
  INVALID_EMAIL("INVALID_EMAIL:The email address is invalid");
  private String errorMessage;

  IssueReportMessage(String errorMessage) {
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
}
