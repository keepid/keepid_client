package PDFTest;

import Config.AppConfig;
import Config.MongoConfig;
import PDF.PdfController;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

public class PdfMongoTests {
  static final int serverPort = 1234;
  static final String serverURL = "http://localhost:" + serverPort;
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
    PdfController pdfController = new PdfController(db);
    UserController userController = new UserController(db);
    app.start(serverPort);
    app.post("/login", userController.loginUser);
    app.post("/upload", pdfController.pdfUpload);
    app.post("/download", pdfController.pdfDownload);
    app.post("/delete-document", pdfController.pdfDelete);
    app.post("/get-documents", pdfController.pdfGetAll);
    app.post("/logout", userController.logout);
    try {
      TestUtils.tearDownTestDB();
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
    login("adminBSM", "adminBSM");
    uploadTestPDF();
    logout();
  }

  @Test
  public void uploadValidPDFTestExists() {
    login("adminBSM", "adminBSM");
    uploadTestPDF();
    searchTestPDF();
    logout();
  }

  @Test
  public void uploadValidPDFTestExistsAndDelete() {
    login("adminBSM", "adminBSM");
    uploadTestPDF();
    JSONObject allDocuments = searchTestPDF();
    String idString = allDocuments.getJSONArray("documents").getJSONObject(0).getString("id");
    delete(idString);
    logout();
  }

  @Test
  public void uploadInvalidPDFTypeTest() {
    login("adminBSM", "adminBSM");
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    HttpResponse<String> uploadResponse =
        Unirest.post(serverURL + "/upload")
            .field("pdfType", "")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF_TYPE");
    logout();
  }

  public static void delete(String id) {
    JSONObject body = new JSONObject();
    body.put("pdfType", "APPLICATION");
    body.put("fileId", id);
    HttpResponse<String> deleteResponse =
        Unirest.post(serverURL + "/delete-document").body(body.toString()).asString();
    JSONObject deleteResponseJSON = TestUtils.responseStringToJSON(deleteResponse.getBody());
    assertThat(deleteResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static void login(String username, String password) {
    JSONObject body = new JSONObject();
    body.put("password", username);
    body.put("username", password);
    HttpResponse<String> loginResponse =
        Unirest.post(serverURL + "/login").body(body.toString()).asString();
    JSONObject loginResponseJSON = TestUtils.responseStringToJSON(loginResponse.getBody());
    assertThat(loginResponseJSON.getString("status")).isEqualTo("AUTH_SUCCESS");
  }

  public static void logout() {
    HttpResponse<String> logoutResponse = Unirest.post(serverURL + "/logout").asString();
    System.out.println(logoutResponse.getBody());
    JSONObject logoutResponseJSON = TestUtils.responseStringToJSON(logoutResponse.getBody());
    assertThat(logoutResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static void uploadTestPDF() {
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    HttpResponse<String> uploadResponse =
        Unirest.post(serverURL + "/upload")
            .field("pdfType", "APPLICATION")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static JSONObject searchTestPDF() {
    JSONObject body = new JSONObject();
    body.put("pdfType", "APPLICATION");
    HttpResponse<String> getAllDocuments =
        Unirest.post(serverURL + "/get-documents").body(body.toString()).asString();
    JSONObject getAllDocumentsJSON = TestUtils.responseStringToJSON(getAllDocuments.getBody());
    assertThat(getAllDocumentsJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(getAllDocumentsJSON.getJSONArray("documents").getJSONObject(0).getString("filename"))
        .isEqualTo("CIS_401_Final_Progress_Report.pdf");
    return getAllDocumentsJSON;
  }
}
