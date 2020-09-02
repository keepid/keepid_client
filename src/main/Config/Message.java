package Config;

import org.json.JSONObject;

public interface Message {
  JSONObject toJSON();
  JSONObject toJSON(String message);
  String toString();
  String getErrorName();
  String getErrorDescription();
}
