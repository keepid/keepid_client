package PDFTest;

import Config.AppConfig;
import Config.MongoConfig;
import PDF.PdfDelete;
import PDF.PdfDownload;
import PDF.PdfSearch;
import PDF.PdfUpload;
import TestUtils.TestUtils;
import User.UserController;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.fail;

public class PdfMongoTests {
  private static Javalin app = AppConfig.createJavalinApp();
  private static String currentPDFFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "PDFTest";

  @BeforeClass
  public static void setUp() {
    MongoClient testClient = MongoConfig.getMongoTestClient();
    MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());
    PdfUpload pdfUpload = new PdfUpload(db);
    PdfDownload pdfDownload = new PdfDownload(db);
    PdfSearch pdfSearch = new PdfSearch(db);
    PdfDelete pdfDelete = new PdfDelete(db);
    UserController userController = new UserController(db);
    app.start(1234);
    app.post("/login", userController.loginUser);
    app.post("/upload", pdfUpload.pdfUpload);
    app.post("/download", pdfDownload.pdfDownload);
    app.post("/delete-document/", pdfDelete.pdfDelete);
    app.post("/get-documents", pdfSearch.pdfSearch);
    try {
      TestUtils.setUpTestDB();
    } catch (Exception e) {
      fail(e);
    }
  }

  @AfterClass
  public static void tearDown() {
    app.stop();
    TestUtils.tearDownTestDB();
  }

  @Test
  public void uploadValidPDFTest() {
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    JSONObject body = new JSONObject();
    body.put("password", "adminBSM");
    body.put("username", "adminBSM");
    Unirest.config().enableCookieManagement(true);
    HttpResponse<String> loginResponse =
        Unirest.post("http://localhost:1234/login").body(body.toString()).asString();
    //    String sessionID = loginResponse.getHeaders().get("Set-Cookie").get(0);
    System.out.println("BELOW");
    System.out.println(TestUtils.responseStringToJSON(loginResponse.getBody()).toString());

    //    HttpResponse<String> actualResponse =
    //        Unirest.post("http://localhost:1234/upload").field("upload", examplePDF).asString();
    //    System.out.println(actualResponse);
  }
}
