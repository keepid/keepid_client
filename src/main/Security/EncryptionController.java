package Security;

import Logger.LogFactory;
import com.google.crypto.tink.Aead;
import com.google.crypto.tink.JsonKeysetReader;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.config.TinkConfig;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.pdfbox.io.IOUtils;
import org.bson.Document;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class EncryptionController {
  Logger logger;
  MongoDatabase db;

  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));

  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public EncryptionController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("EncryptionController");
  }

  // Generates an AEAD Object through Google Tink for encryption and decryption
  public Aead generateAead() throws GeneralSecurityException, IOException {
    TinkConfig.register();
    logger.info("Generating Aead");

    logger.info("Generating Credentials");
    GoogleCredentials.generateCredentials();

    MongoCollection<Document> keyHandles = db.getCollection("keys", Document.class);
    Document keyDocument = keyHandles.find(eq("keyType", "encryption")).first();

    assert keyDocument != null;
    keyDocument.remove("_id");
    keyDocument.remove("keyType");

    JSONObject keyJson = new JSONObject(keyDocument);

    KeysetHandle keysetHandle =
        KeysetHandle.read(
            JsonKeysetReader.withJsonObject(keyJson),
            new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));

    logger.info("KeysetHandle Successfully Generated");
    logger.info("Deleting Credential File");
    GoogleCredentials.deleteCredentials();

    return keysetHandle.getPrimitive(Aead.class);
  }

  public byte[] getEncrypted(byte[] data, byte[] aad) throws GeneralSecurityException, IOException {
    logger.info("Attempting to encrypt");
    try {
      Aead aead = generateAead();
      byte[] ciphertext = aead.encrypt(data, aad);

      logger.info("Encryption done");
      return ciphertext;

    } catch (GeneralSecurityException | IOException e) {
      logger.error("General Security Exception thrown, encrpytion unsuccessful");
      throw e;
    }
  }

  public byte[] getDecrypted(byte[] ciphertext, byte[] aad)
      throws GeneralSecurityException, IOException {
    logger.info("Attempting to decrypt");

    try {
      Aead aead = generateAead();
      byte[] decrypted = aead.decrypt(ciphertext, aad);

      logger.info("Decryption Done");
      return decrypted;
    } catch (GeneralSecurityException | IOException e) {
      logger.error("Decryption Unsuccessful, double check aead");
      throw e;
    }
  }

  public String encryptString(String inputString, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Encrypting " + inputString);

    byte[] stringBytes = inputString.getBytes(StandardCharsets.ISO_8859_1);
    byte[] aad = username.getBytes();

    return new String(getEncrypted(stringBytes, aad), StandardCharsets.ISO_8859_1);
  }

  public String decryptString(String encryptedString, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Decrypting String");
    System.out.println(encryptedString);

    byte[] aad = username.getBytes();
    byte[] encryptedBytes = encryptedString.getBytes(StandardCharsets.ISO_8859_1);

    byte[] decryptedString = getDecrypted(encryptedBytes, aad);

    return new String(decryptedString, StandardCharsets.ISO_8859_1);
  }

  public InputStream encryptFile(InputStream fileStream, String username)
      throws IOException, GeneralSecurityException {
    logger.info("Encrypting file");
    try {
      // InputStream fileStream = new FileInputStream(file);
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
