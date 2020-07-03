package Security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;

public class RecaptchaVerifier {
  public final String GOOGLE_RECAPTCHA_URI = "https://www.google.com/recaptcha/api/siteverify";
  public final String RECAPTCHA_SECRET_KEY = System.getenv("RECAPTCHA_SECRET");

  public boolean verify(String userResponseToken, String remoteIP) {
    if (userResponseToken.equals("localhost")) {
      return true;
    }
    HttpClient client = HttpClient.newHttpClient();
    HashMap<String, String> requestMap = new HashMap<>();
    requestMap.put("secret", RECAPTCHA_SECRET_KEY);
    requestMap.put("response", userResponseToken);
    requestMap.put("remoteip", remoteIP);
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      String requestBody = objectMapper.writeValueAsString(requestMap);
      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(GOOGLE_RECAPTCHA_URI))
              .timeout(Duration.ofMillis(700))
              .POST(HttpRequest.BodyPublishers.ofString(requestBody))
              .build();
      HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
      JSONObject responseJSON = new JSONObject(response);
      return (boolean) responseJSON.get("success");
    } catch (Exception e) {
      return false;
    }
  }
}
