package Security;

import Config.DeploymentLevel;
import Config.MongoConfig;
import TestUtils.TestUtils;
import com.google.common.io.Files;
import com.mongodb.client.MongoDatabase;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class EncryptionTest {

  private static EncryptionController encryptionController;

  private static MongoDatabase testDB;

  @BeforeClass
  public static void setUp() throws GeneralSecurityException, IOException {
    TestUtils.startServer();
    testDB = MongoConfig.getDatabase(DeploymentLevel.STAGING);
    encryptionController = new EncryptionController(testDB);
  }

  @Test
  public void testFileEncryption() throws IOException, GeneralSecurityException {
    String username = "username";

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

    InputStream fileStream = new FileInputStream(file);

    InputStream encryptedFile = encryptionController.encryptFile(fileStream, username);
    InputStream decryptedFile = encryptionController.decryptFile(encryptedFile, username);

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

    Files.write(decryptedFile.readAllBytes(), returnFile);

    boolean isEqualTo = Files.equal(returnFile, file);
    assertEquals(isEqualTo, true);

    // Delete created file
    returnFile.delete();
  }

  //  @Test
  //  public void generateKeyMongo() throws GeneralSecurityException, IOException {
  //    generateAndUploadKeySet();
  //  }

}
