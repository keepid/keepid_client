package PDFUploadTest;

import AccountSecurity.AccountSecurityController;
import AccountSecurity.EmailUtil;
import Config.MongoConfig;
import PDFUpload.PDFType;
import PDFUpload.PdfMongo;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import javax.mail.MessagingException;
import java.io.*;
import java.security.SecureRandom;
import java.util.HashMap;

public class UploadIntTests {
  private static MongoDatabase database;

  @BeforeAll
  static void setUp() {
    MongoConfig.getMongoTestClient();
    database = MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
  }

  @AfterAll
  public static void tearDown() {
    MongoConfig.closeTestConnection();
  }

  public static HashMap<String, String> loadExampleOrg1() {
    HashMap<String, String> exampleOrg1 = new HashMap<>();
    exampleOrg1.put("numUsers", "1000");
    return exampleOrg1;
  }

  @Test
  void listFiles() throws IOException {
    File file = new File("Nope.pdf");
    File fil = new File("CIS331_Final_Review.pdf");
    InputStream inp = new FileInputStream(fil);
    ObjectId a = PdfMongo.upload("Steffen12-Cornwell", "blah", PDFType.APPLICATION, inp, database);
    InputStream inputStream =
        PdfMongo.download("Steffen12-Cornwell", a, PDFType.APPLICATION, database);

    FileOutputStream outputStream = new FileOutputStream(file);
    int read;
    byte[] bytes = new byte[1024];

    while ((read = inputStream.read(bytes)) != -1) {
      outputStream.write(bytes, 0, read);
    }
  }

  @Test
  void changePass() throws UnsupportedEncodingException, MessagingException {
    EmailUtil.sendEmail(
        "smtp.gmail.com",
        "587",
        "keepidtest@gmail.com",
        "Keep ID",
        "t3stPasw",
        "keepidtest@gmail.com",
        "Test",
        "Test");
    AccountSecurityController.change("Steffen12-Cornwell", "test", "test2", database);
  }

  @Test
  void randGen() {
    String newPass = RandomStringUtils.random(8, 30, 122, true, true, null, new SecureRandom());
    System.out.println(newPass);
  }
}
