package Security;

import Logger.LogFactory;
import User.User;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Objects;

public class EncryptionObjectController {
  Logger logger;
  MongoDatabase db;
  EncryptionController encryptionController;

  public EncryptionObjectController(MongoDatabase db) {
    this.db = db;
    LogFactory logFactory = new LogFactory();
    logFactory.createLogger("EncryptionObjectController");
    this.encryptionController = new EncryptionController(db);
  }

  public static final String masterKeyUri = Objects.requireNonNull(System.getenv("MASTERKEYURI"));
  public static final String credentials =
      Objects.requireNonNull(System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));

  public void encryptUser(User user) throws GeneralSecurityException, IOException {
    String username = user.getUsername();

    logger.info("Attempting to encrypt User " + username);
    user.setAddress(encryptionController.encryptString(user.getAddress(), username));
    user.setBirthDate(encryptionController.encryptString(user.getBirthDate(), username));
    user.setCity(encryptionController.encryptString(user.getCity(), username));
    user.setEmail(encryptionController.encryptString(user.getEmail(), username));
    user.setFirstName(encryptionController.encryptString(user.getFirstName(), username));
    user.setLastName(encryptionController.encryptString(user.getLastName(), username));
    user.setPhone(encryptionController.encryptString(user.getPhone(), username));
    user.setZipcode(encryptionController.encryptString(user.getZipcode(), username));
  }

  public void decryptUser(User user) throws GeneralSecurityException, IOException {
    String username = user.getUsername();
    logger.info("User Address " + user.getAddress());

    logger.info("Attempting to decrypt User " + username);

    user.setAddress(encryptionController.decryptString(user.getAddress(), username));
    user.setBirthDate(encryptionController.decryptString(user.getBirthDate(), username));
    user.setCity(encryptionController.decryptString(user.getCity(), username));
    user.setEmail(encryptionController.decryptString(user.getEmail(), username));
    user.setFirstName(encryptionController.decryptString(user.getFirstName(), username));
    user.setLastName(encryptionController.decryptString(user.getLastName(), username));
    user.setPhone(encryptionController.decryptString(user.getPhone(), username));
    user.setZipcode(encryptionController.decryptString(user.getZipcode(), username));
  }
}
