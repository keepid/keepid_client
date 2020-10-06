package Security;

public class EncryptionTest {
  /*
  private static EncryptionController encryptionController;

  @BeforeClass
  public static void setUp() throws GeneralSecurityException, IOException {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    encryptionController = new EncryptionController(testDB);
  }

  @Test
  public void encryptDecryptStringTest() throws GeneralSecurityException, IOException {
    String string1 = "Hello World 12345 9908";
    String username = "username";

    String encrypted = encryptionController.encryptString(string1, username);
    String decrypted = encryptionController.decryptString(encrypted, username);

    assertEquals(string1, decrypted);
  }

  @Test
  public void encryptDecryptFileTest() throws IOException, GeneralSecurityException {
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
   */
}
