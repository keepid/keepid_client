package Security;

import Config.MongoConfig;
import com.google.common.io.Files;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;

import static org.junit.Assert.assertEquals;

public class encryptionTest {

  MongoClient client = MongoConfig.getMongoClient();
  MongoDatabase db = client.getDatabase("staging");

  EncryptionController encryptionController = new EncryptionController(db);

  @Test
  public void encryptDecryptStringTest() throws GeneralSecurityException, IOException {
    String string1 = "Hello World";
    String username = "avwu";

    byte[] encrypted = encryptionController.encryptString(string1, username);

    String decrypted = encryptionController.decryptString(encrypted, username);

    System.out.println("Encrypting: " + string1);
    System.out.println("Encrypted Result: " + encrypted.toString());
    System.out.println("Decrypted Result: " + decrypted);

    assertEquals(string1, decrypted);
  }

  @Test
  public void encryptDecryptFileTest() throws IOException, GeneralSecurityException {
    String username = "avwu";

    File file =
        new File(
            Paths.get("").toAbsolutePath().toString()
                + File.separator
                + "src"
                + File.separator
                + "test"
                + File.separator
                + "resources"
                + File.separator
                + "Application_for_a_Birth_Certificate.pdf");

    byte[] encryptedFile = encryptionController.encryptFile(file, username);
    byte[] decryptedFile = encryptionController.decryptFile(encryptedFile, username);

    File returnFile =
        new File(
            Paths.get("").toAbsolutePath().toString()
                + File.separator
                + "src"
                + File.separator
                + "test"
                + File.separator
                + "resources"
                + File.separator
                + "TESTRETURNBIRTHCERT.pdf");

    Files.write(decryptedFile, returnFile);

    boolean isEqualTo = Files.equal(returnFile, file);
    assertEquals(isEqualTo, true);

    // Delete created file
    returnFile.delete();
  }
}
