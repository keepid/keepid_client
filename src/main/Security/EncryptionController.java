package Security;

import Logger.LogFactory;
import User.User;
import com.google.crypto.tink.Aead;
import com.google.crypto.tink.JsonKeysetReader;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.config.TinkConfig;
import com.google.crypto.tink.integration.gcpkms.GcpKmsClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class EncryptionController {
  Logger logger;
  MongoDatabase db;
  Aead aead;

  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));

  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public EncryptionController(MongoDatabase db) throws GeneralSecurityException, IOException {
    this.db = db;
    LogFactory l = new LogFactory();
    logger = l.createLogger("EncryptionController");
    generateAead();
  }

  // Generates an AEAD Object through Google Tink for encryption and decryption
  public void generateAead() throws GeneralSecurityException, IOException {
    TinkConfig.register();

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

    GoogleCredentials.deleteCredentials();

    aead = keysetHandle.getPrimitive(Aead.class);
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

  public String encryptString(String inputString, String username) throws GeneralSecurityException {
    //    byte[] stringBytes = inputString.getBytes(StandardCharsets.ISO_8859_1);
    //    byte[] aad = username.getBytes();
    //    String encryptedString =
    //        new String(getEncrypted(stringBytes, aad), StandardCharsets.ISO_8859_1);
    //    return encryptedString;
    return inputString;
  }

  public String decryptString(String encryptedString, String username)
      throws GeneralSecurityException {
    //    byte[] aad = username.getBytes();
    //    byte[] encryptedBytes = encryptedString.getBytes(StandardCharsets.ISO_8859_1);
    //
    //    byte[] decryptedString = getDecrypted(encryptedBytes, aad);
    //
    //    return new String(decryptedString, StandardCharsets.ISO_8859_1);
    return encryptedString;
  }

  public InputStream encryptFile(InputStream fileStream, String username)
      throws IOException, GeneralSecurityException {
    //    try {
    //      byte[] fileBytes = IOUtils.toByteArray(fileStream);
    //      byte[] aad = username.getBytes();
    //
    //      InputStream encryptedStream = new ByteArrayInputStream(getEncrypted(fileBytes, aad));
    //
    //      return encryptedStream;
    //
    //    } catch (IOException | GeneralSecurityException e) {
    //      logger.error("Could not find file, or could not turn file into Byte Array");
    //      throw e;
    //    }
    return fileStream;
  }

  public InputStream decryptFile(InputStream encryptedFile, String username)
      throws GeneralSecurityException, IOException {
    //    byte[] aad = username.getBytes();
    //    byte[] encryptedBytes = encryptedFile.readAllBytes();
    //
    //    InputStream decryptedFileStream = new ByteArrayInputStream(getDecrypted(encryptedBytes,
    // aad));
    //
    //    return decryptedFileStream;
    return encryptedFile;
  }

  public void encryptUser(User user, String username) throws GeneralSecurityException, IOException {
    //    user.setAddress(encryptString(user.getAddress(), username));
    //    user.setBirthDate(encryptString(user.getBirthDate(), username));
    //    user.setCity(encryptString(user.getCity(), username));
    //    user.setEmail(encryptString(user.getEmail(), username));
    //    user.setPhone(encryptString(user.getPhone(), username));
    //    user.setZipcode(encryptString(user.getZipcode(), username));
  }

  public void decryptUser(User user, String username) throws GeneralSecurityException, IOException {
    //    user.setAddress(decryptString(user.getAddress(), username));
    //    user.setBirthDate(decryptString(user.getBirthDate(), username));
    //    user.setCity(decryptString(user.getCity(), username));
    //    user.setEmail(decryptString(user.getEmail(), username));
    //    user.setPhone(decryptString(user.getPhone(), username));
    //    user.setZipcode(decryptString(user.getZipcode(), username));
  }
}
