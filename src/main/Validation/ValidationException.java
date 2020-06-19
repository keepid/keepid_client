package Validation;

import org.json.JSONObject;

public class ValidationException extends Exception {

  private JSONObject messageJson;

  // messageJson should contain a status and a message.
  public ValidationException(JSONObject messageJson) {

    super(messageJson.getString("message"));
    this.messageJson = messageJson;
  }

  public JSONObject getJSON() {
    return this.messageJson;
  }
}
