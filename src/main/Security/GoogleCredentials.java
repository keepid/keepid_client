package Security;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.text.StringEscapeUtils;
import org.json.simple.JSONObject;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Objects;

public class GoogleCredentials {
  public static void generateCredentials() {
    JSONObject credJson = new JSONObject();

    String type = Objects.requireNonNull(System.getenv("TYPE"));
    String projectID = Objects.requireNonNull(System.getenv("PROJECT_ID"));
    String privateKeyID = Objects.requireNonNull(System.getenv("PRIVATE_KEY_ID"));

    String privateKey = Objects.requireNonNull(System.getenv("PRIVATE_KEY"));
    privateKey = new String(Base64.decodeBase64(privateKey));

    String clientEmail = Objects.requireNonNull(System.getenv("CLIENT_EMAIL"));
    String clientID = Objects.requireNonNull(System.getenv("CLIENT_ID"));
    String authURI = Objects.requireNonNull(System.getenv("AUTH_URI"));
    String tokenURI = Objects.requireNonNull(System.getenv("TOKEN_URI"));
    String authProvider = Objects.requireNonNull(System.getenv("AUTH_PROVIDER"));
    String clientX = Objects.requireNonNull(System.getenv("CLIENT_X"));

    credJson.put("type", type);
    credJson.put("project_id", projectID);
    credJson.put("private_key_id", privateKeyID);
    credJson.put("private_key", privateKey);
    credJson.put("client_email", clientEmail);
    credJson.put("client_id", clientID);
    credJson.put("auth_uri", authURI);
    credJson.put("token_uri", tokenURI);
    credJson.put("auth_provider_x509_cert_url", authProvider);
    credJson.put("client_x509_cert_url", clientX);

    try {
      FileWriter credFile = new FileWriter("keepid-google-kms.json");
      credFile.write(StringEscapeUtils.unescapeJava(credJson.toString()));
      credFile.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public static void deleteCredentials() {
    File credentialFile =
        new File(
            Paths.get("").toAbsolutePath().toString() + File.separator + "keepid-google-kms.json");

    credentialFile.delete();
  }
}
