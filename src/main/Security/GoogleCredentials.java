package Security;

import Config.DeploymentLevel;
import Config.MongoConfig;
import com.google.crypto.tink.JsonKeysetWriter;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.aead.AesGcmKeyManager;
import com.google.crypto.tink.config.TinkConfig;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.text.StringEscapeUtils;
import org.bson.Document;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Objects;

public class GoogleCredentials {
  private static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));
  private static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public static void generateCredentials() {
    JSONObject credJson = new JSONObject();

    String type = Objects.requireNonNull(System.getenv("TYPE"));
    String projectID = Objects.requireNonNull(System.getenv("PROJECT_ID"));
    String privateKeyID = Objects.requireNonNull(System.getenv("PRIVATE_KEY_ID"));

    String privateKey = Objects.requireNonNull(System.getenv("PRIVATE_KEY"));
    // privateKey = new String(Base64.decodeBase64(privateKey));

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

  public static void generateAndUploadEncryptionKey(DeploymentLevel deploymentLevel)
      throws GeneralSecurityException, IOException, ParseException {
    TinkConfig.register();
    GoogleCredentials.generateCredentials();
    KeysetHandle keysetHandle = KeysetHandle.generateNew(AesGcmKeyManager.aes256GcmTemplate());
    String keysetFilename = "test_encryption_key.json";

    File keysetFile = new File(keysetFilename);
    keysetHandle.write(
        JsonKeysetWriter.withFile(keysetFile),
        new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));

    String keyString = (new JSONParser().parse(new FileReader(keysetFilename))).toString();
    uploadEncryptionKey(keyString, deploymentLevel);
    keysetFile.delete();
    GoogleCredentials.deleteCredentials();
  }

  private static void uploadEncryptionKey(String keyString, DeploymentLevel deploymentLevel) {
    MongoConfig.getMongoClient();
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    assert db != null;
    // db.createCollection("keys");

    db.getCollection("keys").insertOne(Document.parse(keyString).append("keyType", "encryption"));
  }
}
