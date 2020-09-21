package Validation;

import Config.Message;
import org.json.JSONObject;

public class ValidationException extends Exception implements Message {

  private JSONObject messageJson;

  // messageJson should contain a status and a message.
  public ValidationException(JSONObject messageJson) {

    super(messageJson.getString("message"));
    this.messageJson = messageJson;
  }

  public JSONObject getJSON() {
    return this.messageJson;
  }

  @Override
  public JSONObject toJSON() {
    return this.messageJson;
  }

  @Override
  public JSONObject toJSON(String message) {
    return this.messageJson;
  }

  @Override
  public String getErrorName() {
    return null;
  }

  @Override
  public String getErrorDescription() {
    return null;
  }

  @Override
  public String toResponseString() {
    return null;
  }
}
