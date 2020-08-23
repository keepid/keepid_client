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

import java.io.File;
import java.io.FileInputStream;
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

  public Aead generateAead() throws GeneralSecurityException, IOException {
    TinkConfig.register();
    logger.info("Generating Aead");

    MongoCollection<Document> keyHandles = db.getCollection("keys", Document.class);
    Document keyDocument = keyHandles.find(eq("keyType", "encryption")).first();

    keyDocument.remove("_id");
    keyDocument.remove("keyType");

    JSONObject keyJson = new JSONObject(keyDocument.toJson());

    KeysetHandle keysetHandle =
        KeysetHandle.read(
            JsonKeysetReader.withJsonObject(keyJson),
            new GcpKmsClient().withCredentials(credentials).getAead(masterKeyUri));

    logger.info("KeysetHandle Successfully Generated");

    Aead aead = keysetHandle.getPrimitive(Aead.class);

    return aead;
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

  public byte[] encryptString(String inputString, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Encrypting " + inputString);

    byte[] stringBytes = inputString.getBytes();
    byte[] aad = username.getBytes();

    byte[] encryptedString = getEncrypted(stringBytes, aad);
    return encryptedString;
  }

  public byte[] encryptFile(File file, String username)
      throws IOException, GeneralSecurityException {
    logger.info("Encrypting file " + file.getName());
    try {
      InputStream fileStream = new FileInputStream(file);
      byte[] fileBytes = IOUtils.toByteArray(fileStream);
      byte[] aad = username.getBytes();

      byte[] encryptedFile = getEncrypted(fileBytes, aad);
      return encryptedFile;

    } catch (IOException | GeneralSecurityException e) {
      logger.error("Could not find file, or could not turn file into Byte Array");
      throw e;
    }
  }

  public String decryptString(byte[] encryptedString, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Decrypting String");

    byte[] aad = username.getBytes();
    byte[] decryptedString = getDecrypted(encryptedString, aad);

    String result = new String(decryptedString, StandardCharsets.UTF_8);
    return result;
  }

  public byte[] decryptFile(byte[] encryptedFile, String username)
      throws GeneralSecurityException, IOException {
    logger.info("Decrypting File");
    byte[] aad = username.getBytes();

    byte[] decryptedFile = getDecrypted(encryptedFile, aad);
    return decryptedFile;
  }
}
