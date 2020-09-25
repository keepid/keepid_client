package Config;

import org.json.JSONObject;

public interface Message {
  JSONObject toJSON();

  JSONObject toJSON(String message);

  String getErrorName();

  String getErrorDescription();

  String toResponseString();
}
