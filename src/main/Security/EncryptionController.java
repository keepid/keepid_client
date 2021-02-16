package Security;

import com.google.crypto.tink.Aead;
import com.google.crypto.tink.JsonKeysetReader;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.aead.AeadConfig;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.bson.Document;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Objects;

@Slf4j
public class EncryptionController {
  private MongoDatabase db;
  private Aead aead;

  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));

  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public EncryptionController(MongoDatabase db) throws GeneralSecurityException, IOException {
    this.db = db;
    this.aead = generateAead();
  }

  private Aead generateAead() throws GeneralSecurityException, IOException {
    log.info("Generating AEAD Prim");
    AeadConfig.register();

    MongoCollection<Document> keyHandles = db.getCollection("keys", Document.class);
    Document keyDocument = keyHandles.find().first();

    if (keyDocument == null) {
      throw new GeneralSecurityException();
    }
    keyDocument.remove("_id");
    keyDocument.remove("keyType");

    JSONObject keyJson = new JSONObject(keyDocument);

    KeysetHandle keysetHandle =
        KeysetHandle.read(
            JsonKeysetReader.withJsonObject(keyJson),
            new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));

    return keysetHandle.getPrimitive(Aead.class);
  }

  public byte[] getEncrypted(byte[] data, byte[] aad) throws GeneralSecurityException {
    try {
      byte[] ciphertext = aead.encrypt(data, aad);

      return ciphertext;

    } catch (GeneralSecurityException e) {
      log.error("General Security Exception thrown, encrpytion unsuccessful");
      throw e;
    }
  }

  public byte[] getDecrypted(byte[] ciphertext, byte[] aad) throws GeneralSecurityException {
    try {
      byte[] decrypted = aead.decrypt(ciphertext, aad);

      return decrypted;
    } catch (GeneralSecurityException e) {
      log.error("Decryption Unsuccessful, double check aead");
      throw e;
    }
  }

  public InputStream encryptFile(InputStream fileStream, String username)
      throws IOException, GeneralSecurityException {
    log.info("Encrypting File");
    try {
      byte[] fileBytes = IOUtils.toByteArray(fileStream);
      byte[] aad = username.getBytes();

      InputStream encryptedStream = new ByteArrayInputStream(getEncrypted(fileBytes, aad));

      return encryptedStream;

    } catch (IOException | GeneralSecurityException e) {
      log.error("Could not find file, or could not turn file into Byte Array");
      throw e;
    }
  }

  public InputStream decryptFile(InputStream encryptedFile, String username)
      throws GeneralSecurityException, IOException {
    log.info("Decrypting File");
    byte[] aad = username.getBytes();
    byte[] encryptedBytes = encryptedFile.readAllBytes();

    InputStream decryptedFileStream = new ByteArrayInputStream(getDecrypted(encryptedBytes, aad));

    return decryptedFileStream;
  }
}
