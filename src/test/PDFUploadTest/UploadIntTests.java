package PDFUploadTest;

import Config.MongoConfig;
import PDF.PDFType;
import PDF.PdfMongo;
import Security.AccountSecurityController;
import Security.EmailUtil;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.types.ObjectId;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

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
    JSONObject a =
        PdfMongo.upload(
            "Steffen12-Cornwell",
            "Keep.id",
            UserType.Client,
            "filename",
            PDFType.APPLICATION,
            inp,
            database);
    ObjectId id = (ObjectId) a.get("id");
    InputStream inputStream =
        PdfMongo.download(
            "Steffen12-Cornwell", "Keep.id", UserType.Admin, id, PDFType.APPLICATION, database);

    FileOutputStream outputStream = new FileOutputStream(file);
    int read;
    byte[] bytes = new byte[1024];

    while ((read = inputStream.read(bytes)) != -1) {
      outputStream.write(bytes, 0, read);
    }
  }

  @Test
  void changePass() throws UnsupportedEncodingException {
    EmailUtil.sendEmail("Keep ID", "keepidtest@gmail.com", "Test", "Test");
    AccountSecurityController.changePassword("Steffen12-Cornwell", "test", "test2", database);
  }

  @Test
  void randGen() {
    String newPass = RandomStringUtils.random(8, 30, 122, true, true, null, new SecureRandom());
    System.out.println(newPass);
  }
}
