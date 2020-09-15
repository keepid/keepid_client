package TestUtils;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Organization.Organization;
import Security.GoogleCredentials;
import com.google.crypto.tink.Aead;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.json.simple.parser.ParseException;
import org.junit.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TestUtilsUnitTests {

  @Test
  public void setUpAndTeardownTest() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    MongoCollection<Organization> orgCollection =
        testDB.getCollection("organization", Organization.class);
    assertEquals(
        "311 Broad Street",
        Objects.requireNonNull(
                orgCollection.find(Filters.eq("orgName", "Broad Street Ministry")).first())
            .getOrgStreetAddress());
    TestUtils.tearDownTestDB();
  }

  @Test
  public void testEncryptionSetup() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    try {
      GoogleCredentials.generateAndUploadEncryptionKey(DeploymentLevel.TEST);
      Aead aead = TestUtils.getAead();
      String original = "hello world";
      byte[] ciphertext = aead.encrypt(original.getBytes(), "".getBytes());
      byte[] decrypted = aead.decrypt(ciphertext, "".getBytes());
      assertEquals(original, new String(decrypted));
    } catch (GeneralSecurityException | IOException | ParseException e) {
      e.printStackTrace();
      assert false;
    }
    TestUtils.tearDownTestDB();
  }
}
