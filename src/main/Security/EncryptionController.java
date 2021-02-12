package Security;

import Logger.LogFactory;
import com.google.crypto.tink.Aead;
import com.google.crypto.tink.JsonKeysetReader;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.aead.AeadConfig;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.io.IOUtils;
import org.bson.Document;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Objects;

public class EncryptionController {
  private MongoDatabase db;
  private Logger logger;
  private Aead aead;

  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));

  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public EncryptionController(MongoDatabase db) throws GeneralSecurityException, IOException {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("EncryptionController");
    this.aead = generateAead();
  }

  private Aead generateAead() throws GeneralSecurityException, IOException {
    logger.info("Generating AEAD Prim");
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
      logger.error("General Security Exception thrown, encrpytion unsuccessful");
      throw e;
    }
  }

  public byte[] getDecrypted(byte[] ciphertext, byte[] aad) throws GeneralSecurityException {
    try {
      byte[] decrypted = aead.decrypt(ciphertext, aad);

      return decrypted;
    } catch (GeneralSecurityException e) {
      logger.error("Decryption Unsuccessful, double check aead");
      throw e;
    }
  }

  public InputStream encryptFile(InputStream fileStream, String username)
      throws IOException, GeneralSecurityException {
    logger.info("Encrypting File");
    try {
      byte[] fileBytes = IOUtils.toByteArray(fileStream);
      byte[] aad = username.getBytes();

      InputStream encryptedStream = new ByteArrayInputStream(getEncrypted(fileBytes, aad));

      return encryptedStream;

    } catch (IOException | GeneralSecurityException e) {
      logger.error("Could not find file, or could not turn file into Byte Array");
      throw e;
    }
  }

  public InputStream decryptFile(InputStream encryptedFile, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Decrypting File");
    byte[] aad = username.getBytes();
    byte[] encryptedBytes = encryptedFile.readAllBytes();

    InputStream decryptedFileStream = new ByteArrayInputStream(getDecrypted(encryptedBytes, aad));

    return decryptedFileStream;
  }
}
