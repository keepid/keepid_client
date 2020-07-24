package PDFTest;

import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.nio.file.Paths;
import java.util.LinkedList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

public class PdfMongoTests {
  private static String currentPDFFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "PDFTest";

  private static String resourcesFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "resources";

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
  public void uploadValidPDFFormTest() {
    TestUtils.login("adminBSM", "adminBSM");
    uploadTestFormPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadAnnotatedPDFFormTest() {
    TestUtils.login("adminBSM", "adminBSM");
    uploadTestAnnotatedFormPDF();
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
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .field("pdfType", "")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF_TYPE");
    TestUtils.logout();
  }

  @Test
  public void uploadNullPDFTest() {
    TestUtils.login("adminBSM", "adminBSM");
    File examplePDF = null;
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .header("Content-Disposition", "attachment")
            .field("pdfType", "APPLICATION")
            .asString();

    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF");
    TestUtils.logout();
  }

  // ALLOWS FOR .DOCX TO BE UPLOADED since it is an "octet-stream," but I think this happens for all
  // files.
  // What should be the behavior for upload? - we probably want to allow for different document
  // types,
  // so this test is likely not useful.
  @Test
  public void uploadDocxTest() {
    TestUtils.login("adminBSM", "adminBSM");
    File exampleDocx = new File(currentPDFFolderPath + File.separator + "job_description.docx");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .header("Content-Disposition", "attachment")
            .field("pdfType", "APPLICATION")
            .field("file", exampleDocx)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF");
  }

  @Test
  public void getApplicationQuestionsIPFormTest() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "intellectual_property_release_fillable.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    String[] fieldNames = {
      "Work",
      "Venture Lab",
      "Signature of Company",
      "Company",
      "Date1",
      "Date2",
      "Signature of Venture Lab"
    };
    for (int i = 0; i < applicationsQuestionsResponseJSON.getJSONArray("fields").length(); i++) {
      assertThat(
              applicationsQuestionsResponseJSON
                  .getJSONArray("fields")
                  .getJSONObject(i)
                  .get("fieldName"))
          .isEqualTo(fieldNames[i]);
    }

    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionsTestPDFTest() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // comb through JSON for each field, to see if it is there.
    LinkedList<String[][]> fieldsToCheck = new LinkedList<String[][]>();
    // each array has format {{fieldType}, {fieldName} {fieldValueOptions}}
    String[][] radioButtons = {{"RadioButton"}, {"Radiobuttons"}, {"Yes", "No", "Maybe"}};
    String[][] name = {{"TextField"}, {"Name"}, {}};
    String[][] title = {{"TextField"}, {"Title"}, {}};
    String[][] address = {{"TextField"}, {"Address"}, {}};
    String[][] date = {{"TextField"}, {"currentdate_af_date"}, {}};
    String[][] diffAddress = {{"TextField"}, {"A different address"}, {}};
    String[][] chicken = {{"CheckBox"}, {"Chicken"}, {}};
    String[][] vegetables = {{"CheckBox"}, {"Vegetables"}, {}};
    String[][] steaks = {{"CheckBox"}, {"Ribeye Steaks"}, {}};
    String[][] tomatoes = {{"CheckBox"}, {"Tomatoes"}, {}};
    String[][] dropdown = {{"ComboBox"}, {"Dropdown"}, {"Choice1", "Choice2", "Choice3"}};
    String[][] listbox = {{"ListBox"}, {"Combobox"}, {"Choice1", "Choice2", "Choice3"}};

    fieldsToCheck.add(radioButtons);
    fieldsToCheck.add(name);
    fieldsToCheck.add(address);
    fieldsToCheck.add(date);
    fieldsToCheck.add(diffAddress);
    fieldsToCheck.add(chicken);
    fieldsToCheck.add(title);
    fieldsToCheck.add(vegetables);
    fieldsToCheck.add(steaks);
    fieldsToCheck.add(tomatoes);
    fieldsToCheck.add(dropdown);
    fieldsToCheck.add(listbox);

    checkForFields(applicationsQuestionsResponseJSON, fieldsToCheck);

    TestUtils.logout();
  }

  public void checkForFields(
      JSONObject applicationsQuestionsResponseJSON, LinkedList<String[][]> fieldsToCheck) {
    for (String[][] arr : fieldsToCheck) {
      String fieldType = arr[0][0];
      String fieldName = arr[1][0];
      JSONArray fieldValueOptions = new JSONArray(arr[2]);
      boolean found_type = false;
      boolean found_name = false;
      for (int i = 0; i < applicationsQuestionsResponseJSON.getJSONArray("fields").length(); i++) {
        String curr_name =
            applicationsQuestionsResponseJSON
                .getJSONArray("fields")
                .getJSONObject(i)
                .get("fieldName")
                .toString();
        String curr_type =
            applicationsQuestionsResponseJSON
                .getJSONArray("fields")
                .getJSONObject(i)
                .get("fieldType")
                .toString();
        if (curr_name.equals(fieldName) && curr_type.equals(fieldType)) {
          found_name = true;
          found_type = true;
          JSONArray curr_options =
              applicationsQuestionsResponseJSON
                  .getJSONArray("fields")
                  .getJSONObject(i)
                  .getJSONArray("fieldValueOptions");
          assertThat(curr_options.toList()).isEqualTo(fieldValueOptions.toList());
        }
      }
      assertThat(found_name).isTrue();
      assertThat(found_type).isTrue();
    }
  }

  @Test
  public void getApplicationQuestionsBirthCertificateTest() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationPDF =
        new File(resourcesFolderPath + File.separator + "Application_for_a_Birth_Certificate.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // comb through JSON for each field, to see if it is there.
    LinkedList<String[][]> fieldsToCheck = new LinkedList<String[][]>();
    // each array has format {{fieldType}, {fieldName} {fieldValueOptions}}
    String[][] street = {{"TextField"}, {"Street"}, {}};
    String[][] intended_use = {
      {"RadioButton"},
      {"Intended_use"},
      {
        "Choice1-travel/passport",
        "Choice2-school",
        "Choice3-drivers_license",
        "Choice4-social security/benefits",
        "Choice5-dual citizenship",
        "Choice6-employment",
        "Choice7-other-specify"
      }
    };
    String[][] city = {{"TextField"}, {"City"}, {}};
    String[][] email_address = {{"TextField"}, {"Email_Address"}, {}};
    String[][] relationship = {
      {"ComboBox"},
      {"Relationship_Dropdown"},
      {
        " ",
        "Self",
        "Mother",
        "Father",
        "Brother",
        "Daughter",
        "Grandchild",
        "Grandparent",
        "Sister",
        "Spouse",
        "Son",
        "Other - "
      }
    };
    fieldsToCheck.add(street);
    fieldsToCheck.add(intended_use);
    fieldsToCheck.add(city);
    fieldsToCheck.add(email_address);
    fieldsToCheck.add(relationship);
    checkForFields(applicationsQuestionsResponseJSON, fieldsToCheck);
  }

  @Test
  public void fillApplicationQuestionsSimpleFormTest() {
    TestUtils.login("adminBSM", "adminBSM");
  }

  public static String uploadFileAndGetFileId(File file, String pdfType) {
    // upload file
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .header("Content-Disposition", "attachment")
            .field("pdfType", pdfType)
            .field("file", file)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // get file id
    JSONObject body = new JSONObject();
    body.put("pdfType", "FORM");
    body.put("annotated", false);
    HttpResponse<String> getForm =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getFormJSON = TestUtils.responseStringToJSON(getForm.getBody());

    String fileId = getFormJSON.getJSONArray("documents").getJSONObject(0).getString("id");
    return fileId;
  }

  public static void reset() {
    try {
      TestUtils.tearDownTestDB();
      TestUtils.setUpTestDB();
    } catch (Exception e) {
      fail(e);
    }
  }

  public static void delete(String id) {
    JSONObject body = new JSONObject();
    body.put("pdfType", "APPLICATION");
    body.put("fileId", id);
    HttpResponse<String> deleteResponse =
        Unirest.post(TestUtils.getServerUrl() + "/delete-document")
            .body(body.toString())
            .asString();
    JSONObject deleteResponseJSON = TestUtils.responseStringToJSON(deleteResponse.getBody());
    assertThat(deleteResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static void uploadTestPDF() {
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");

    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .field("pdfType", "APPLICATION")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  public static void uploadTestFormPDF() {
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .field("pdfType", "FORM")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONObject body = new JSONObject();
    body.put("pdfType", "FORM");
    body.put("annotated", false);
    HttpResponse<String> getForm =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getFormJSON = TestUtils.responseStringToJSON(getForm.getBody());
    // check that form has annotated = false in DB
    assertThat(getFormJSON.getJSONArray("documents").getJSONObject(0).getBoolean("annotated"))
        .isEqualTo(false);
  }

  public static void uploadTestAnnotatedFormPDF() {
    // upload unannotated form
    File examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .field("pdfType", "FORM")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // download unannotated form
    JSONObject body = new JSONObject();
    body.put("pdfType", "FORM");
    body.put("annotated", false);
    HttpResponse<String> getForm =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getFormJSON = TestUtils.responseStringToJSON(getForm.getBody());
    // check that form has annotated = false in DB
    System.out.println(getFormJSON.toString());
    assertThat(getFormJSON.getJSONArray("documents").getJSONObject(0).getBoolean("annotated"))
        .isEqualTo(false);
    String fileId = getFormJSON.getJSONArray("documents").getJSONObject(0).getString("id");

    // reupload same form, now annotated
    examplePDF =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .field("pdfType", "FORM")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .field("fileId", fileId)
            .asString();
    uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // download newly annotated form
    body = new JSONObject();
    body.put("pdfType", "FORM");
    body.put("annotated", true);
    getForm =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    getFormJSON = TestUtils.responseStringToJSON(getForm.getBody());
    // check that form has annotated = TRUE in DB
    assertThat(getFormJSON.getJSONArray("documents").getJSONObject(0).getBoolean("annotated"))
        .isEqualTo(true);
  }

  public static JSONObject searchTestPDF() {
    JSONObject body = new JSONObject();
    body.put("pdfType", "APPLICATION");
    HttpResponse<String> getAllDocuments =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getAllDocumentsJSON = TestUtils.responseStringToJSON(getAllDocuments.getBody());
    assertThat(getAllDocumentsJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(getAllDocumentsJSON.getJSONArray("documents").getJSONObject(0).getString("filename"))
        .isEqualTo("CIS_401_Final_Progress_Report.pdf");
    return getAllDocumentsJSON;
  }
}
