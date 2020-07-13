package PDFTest;

import TestUtils.TestUtils;
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
    TestUtils.startServer();
    try {
      TestUtils.tearDownTestDB();
      TestUtils.setUpTestDB();
    } catch (Exception e) {
      fail(e);
    }
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.stopServer();
    TestUtils.tearDownTestDB();
  }

  @Test
  public void uploadValidPDFTest() {
    TestUtils.login("adminBSM", "adminBSM");
    uploadTestPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadValidPDFTestExists() {
    TestUtils.login("adminBSM", "adminBSM");
    uploadTestPDF();
    searchTestPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadValidPDFTestExistsAndDelete() {
    TestUtils.login("adminBSM", "adminBSM");
    uploadTestPDF();
    JSONObject allDocuments = searchTestPDF();
    String idString = allDocuments.getJSONArray("documents").getJSONObject(0).getString("id");
    delete(idString);
    TestUtils.logout();
  }

  @Test
  public void uploadInvalidPDFTypeTest() {
    TestUtils.login("adminBSM", "adminBSM");
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
    TestUtils.logout();
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
