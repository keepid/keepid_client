package Security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.crypto.tink.JsonKeysetWriter;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.aead.AeadConfig;
import com.google.crypto.tink.aead.AesGcmKeyManager;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.Objects;

public class EncryptionTools {
  public MongoDatabase db;
  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));
  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));

  public EncryptionTools(MongoDatabase db) {
    this.db = db;
  }

  // Used for maintaining keys in mongodb, use with caution.
  public void generateAndUploadKeySet() throws GeneralSecurityException, IOException {
    AeadConfig.register();
    MongoCollection<Document> keyHandles = this.db.getCollection("keys", Document.class);
    keyHandles.deleteMany(new Document());

    KeysetHandle keysetHandle = KeysetHandle.generateNew(AesGcmKeyManager.aes256GcmTemplate());

    String keysetFileName = "key.json";
    keysetHandle.write(
        JsonKeysetWriter.withFile(new File(keysetFileName)),
        new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));
    ObjectMapper objectMapper = new ObjectMapper();
    File file = new File("key.json");
    Map<String, Object> map =
        objectMapper.readValue(file, new TypeReference<Map<String, Object>>() {});
    JSONObject keyJson = new JSONObject(map);

    //    Document keyDocument = new Document("key.json");
    keyHandles.insertOne(Document.parse(keyJson.toString()));
  }
}
