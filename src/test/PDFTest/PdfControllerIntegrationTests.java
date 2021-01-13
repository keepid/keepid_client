package PDFTest;

import PDF.PdfController;
import Security.EncryptionUtils;
import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.commons.io.FileUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Iterator;
import java.util.LinkedList;

import static PDFTest.PdfControllerIntegrationTestHelperMethods.*;
import static TestUtils.TestUtils.getFieldValues;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

public class PdfControllerIntegrationTests {
  private static EncryptionUtils encryptionUtils;
  public static String username = "adminBSM";;

  public static String currentPDFFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "PDFTest";

  public static String resourcesFolderPath =
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
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  @Test
  public void uploadValidPDFTest() {
    TestUtils.login(username, username);
    uploadTestPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadFormTest() {
    TestUtils.login(username, username);
    uploadTestFormPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadAnnotatedPDFFormTest() {
    TestUtils.login(username, username);
    uploadTestAnnotatedFormPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadValidPDFTestExists() {
    TestUtils.login(username, username);
    uploadTestPDF();
    searchTestPDF();
    TestUtils.logout();
  }

  @Test
  public void uploadValidPDFTestExistsAndDelete() {
    TestUtils.login(username, username);
    uploadTestPDF();
    JSONObject allDocuments = searchTestPDF();
    String idString = allDocuments.getJSONArray("documents").getJSONObject(0).getString("id");
    // delete(idString);
    TestUtils.logout();
  }

  @Test
  public void uploadInvalidPDFTypeTest() {
    TestUtils.login(username, username);
    File examplePDF =
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
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
    TestUtils.login(username, username);
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

  // Need to get it so it will only allow PDF and not docx+
  //  @Test
  //  public void uploadDocxTest() {
  //    TestUtils.login(username, username);
  //    File exampleDocx = new File(resourcesFolderPath + File.separator + "job_description.docx");
  //    HttpResponse<String> uploadResponse =
  //        Unirest.post(TestUtils.getServerUrl() + "/upload")
  //            .header("Content-Disposition", "attachment")
  //            .field("pdfType", "APPLICATION")
  //            .field("file", exampleDocx)
  //            .asString();
  //    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
  //    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF");
  //    TestUtils.logout();
  //  }

  @Test
  public void downloadTestFormTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    File testPdf = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(testPdf, "FORM");

    JSONObject body = new JSONObject();
    body.put("fileId", fileId);
    body.put("pdfType", "FORM");
    HttpResponse<File> downloadFileResponse =
        Unirest.post(TestUtils.getServerUrl() + "/download")
            .body(body.toString())
            .asFile(resourcesFolderPath + File.separator + "downloaded_form.pdf");
    assertThat(downloadFileResponse.getStatus()).isEqualTo(200);
  }

  @Test
  public void downloadPDFTypeNullTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    File testPdf = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(testPdf, "FORM");

    JSONObject body = new JSONObject();
    body.put("fileId", fileId);
    body.put("pdfType", (String) null);
    HttpResponse downloadFileResponse =
        Unirest.post(TestUtils.getServerUrl() + "/download").body(body.toString()).asString();
    assertThat(downloadFileResponse.getStatus()).isEqualTo(500);
  }

  @Test
  public void getApplicationQuestionsIPFormTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "intellectual_property_release_fillable.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
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

    // delete(fileId, "FORM");
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionsTestPDFTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
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
    String[][] chicken = {{"CheckBox"}, {"Chicken"}, {"Yes"}};
    String[][] vegetables = {{"CheckBox"}, {"Vegetables"}, {"Yes"}};
    String[][] steaks = {{"CheckBox"}, {"Ribeye Steaks"}, {"Yes"}};
    String[][] tomatoes = {{"CheckBox"}, {"Tomatoes"}, {"Yes"}};
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

    // delete(fileId, "FORM");
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionsBirthCertificateTest()
      throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "Application_for_a_Birth_Certificate_2.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
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
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionsMediaReleaseTest()
      throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(resourcesFolderPath + File.separator + "Media_Release_fillable.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // comb through JSON for each field, to see if it is there.
    LinkedList<String[][]> fieldsToCheck = new LinkedList<String[][]>();
    // each array has format {{fieldType}, {fieldName} {fieldValueOptions}}
    String[][] street = {{"TextField"}, {"Production Title"}, {}};
    fieldsToCheck.add(street);
    checkForFields(applicationsQuestionsResponseJSON, fieldsToCheck);
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionsSS5Test() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "ss-5.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    // delete(fileId, "FORM");
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionBlankPDFTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationDocx =
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    String fileId = uploadFileAndGetFileId(applicationDocx, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("INVALID_PDF");
    //    assertThat(applicationsQuestionsResponseJSON.getJSONArray("fields").toString())
    //        .isEqualTo(new JSONArray().toString());
    // delete(fileId, "FORM");
    TestUtils.logout();
  }

  @Test
  public void getDocumentsTargetUser() throws IOException, GeneralSecurityException {
    TestUtils.login("workerttfBSM", "workerttfBSM");
    clearAllDocuments();
    File applicationPDF = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");
    TestUtils.logout();
    TestUtils.login(username, username);

    JSONObject body = new JSONObject();
    body.put("pdfType", "FORM");
    body.put("annotated", false);
    body.put("targetUser", "workerttfBSM");
    HttpResponse<String> getForm =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getFormJSON = TestUtils.responseStringToJSON(getForm.getBody());
    String downId = getFormJSON.getJSONArray("documents").getJSONObject(0).getString("id");
    // String fileId = getFormJSON.getJSONArray("documents").getJSONObject(0).getString("id");
    assertThat(fileId).isEqualTo(downId);
    TestUtils.logout();
  }

  @Test
  public void fillApplicationQuestionsTestPDFTest() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    clearAllDocuments();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "testpdf.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());
    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONObject formAnswers = getFormAnswersTestPDFForm(applicationsQuestionsResponseJSON);
    // fill out form
    body = new JSONObject();
    body.put("applicationId", fileId);
    body.put("formAnswers", formAnswers);
    HttpResponse<File> filledForm =
        Unirest.post(TestUtils.getServerUrl() + "/fill-application")
            .body(body.toString())
            .asFile(resourcesFolderPath + File.separator + "testpdf_filled_out.pdf");
    assertThat(filledForm.getStatus()).isEqualTo(200);

    // check if all fields are filled
    JSONObject fieldValues = null;
    try {
      File filled_out_pdf =
          new File(resourcesFolderPath + File.separator + "testpdf_filled_out.pdf");
      PDDocument pdf = PDDocument.load(filled_out_pdf);
      fieldValues = getFieldValues(new FileInputStream(filled_out_pdf));
    } catch (IOException e) {
      assertThat(false).isTrue();
    }
    assertThat(fieldValues).isNotNull();
    checkFormAnswersTestPDFForm(fieldValues);
    TestUtils.logout();
  }

  @Test
  public void fillApplicationQuestionsSS5Test() throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    clearAllDocuments();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "ss-5.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());
    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONObject formAnswers = getFormAnswersTestPDFForm(applicationsQuestionsResponseJSON);
    // fill out form
    body = new JSONObject();
    body.put("applicationId", fileId);
    body.put("formAnswers", formAnswers);
    HttpResponse<File> filledForm =
        Unirest.post(TestUtils.getServerUrl() + "/fill-application")
            .body(body.toString())
            .asFile(resourcesFolderPath + File.separator + "ss-5_filled_out.pdf");
    assertThat(filledForm.getStatus()).isEqualTo(200);

    // check if all fields are filled
    JSONObject fieldValues = null;
    try {
      File filled_out_pdf = new File(resourcesFolderPath + File.separator + "ss-5_filled_out.pdf");
      PDDocument pdf = PDDocument.load(filled_out_pdf);
      fieldValues = getFieldValues(new FileInputStream(filled_out_pdf));
    } catch (IOException e) {
      assertThat(false).isTrue();
    }
    assertThat(fieldValues).isNotNull();
    checkFormAnswersSS5Form(fieldValues);
    // delete(fileId, "FORM");
    TestUtils.logout();
  }

  @Test
  public void getApplicationQuestionMetadataTest() throws IOException, GeneralSecurityException {
    // Test to get application with metadata
    TestUtils.login(username, username);
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "Ann_Too_Pennsylvania_Birth_Certificate.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());
    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");
    assertEquals(
        "Pennsylvania - Application for a Birth Certificate",
        applicationsQuestionsResponseJSON.get("title"));
    assertEquals(
        "An application for a birth certificate in the state of Pennsylvania. Requires a driver's license photocopy to apply",
        applicationsQuestionsResponseJSON.get("description"));
  }

  @Test
  public void getApplicationQuestionsMatchedFieldsTest1()
      throws IOException, GeneralSecurityException {
    // Test simple matched fields in database
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "Ann_Too_Pennsylvania_Birth_Certificate.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONArray fields = applicationsQuestionsResponseJSON.getJSONArray("fields");
    int i = 0;
    JSONObject matchedField = null;
    Iterator<Object> fieldIterator = fields.iterator();
    while (fieldIterator.hasNext()) {
      JSONObject JSONField = (JSONObject) fieldIterator.next();
      // An annotated field
      if (JSONField.getString("fieldName").equals("First Name:firstName")) {
        matchedField = JSONField;
      }
    }
    if (matchedField == null) {
      fail("No matched field found");
    } else {
      assertEquals("Mike", matchedField.getString("fieldDefaultValue"));
      assertEquals(true, matchedField.getBoolean("fieldIsMatched"));
      assertEquals("TextField", matchedField.getString("fieldType"));
      assertEquals("Please Enter Your: First Name", matchedField.getString("fieldQuestion"));
    }
  }

  @Test
  public void getApplicationQuestionsMatchedFieldsTest2()
      throws IOException, GeneralSecurityException {
    // Test simple matched fields in database
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "Ann_Too_Pennsylvania_Birth_Certificate.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONArray fields = applicationsQuestionsResponseJSON.getJSONArray("fields");
    int i = 0;
    JSONObject matchedField = null;
    Iterator<Object> fieldIterator = fields.iterator();
    while (fieldIterator.hasNext()) {
      JSONObject JSONField = (JSONObject) fieldIterator.next();
      // An annotated field
      if (JSONField.getString("fieldName").equals("Date:currentDate")) {
        matchedField = JSONField;
      }
    }
    if (matchedField == null) {
      fail("No matched field found");
    } else {
      assertEquals("", matchedField.getString("fieldDefaultValue"));
      assertEquals(true, matchedField.getBoolean("fieldIsMatched"));
      assertEquals("DateField", matchedField.getString("fieldType"));
      assertEquals("Please Enter Your: Date", matchedField.getString("fieldQuestion"));
    }
  }

  @Test
  public void getApplicationQuestionsMatchedFieldsTest3()
      throws IOException, GeneralSecurityException {
    // Test simple matched fields in database
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(
            resourcesFolderPath + File.separator + "Ann_Too_Pennsylvania_Birth_Certificate.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-application-questions")
            .body(body.toString())
            .asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    JSONArray fields = applicationsQuestionsResponseJSON.getJSONArray("fields");
    int i = 0;
    JSONObject matchedField = null;
    Iterator<Object> fieldIterator = fields.iterator();
    while (fieldIterator.hasNext()) {
      JSONObject JSONField = (JSONObject) fieldIterator.next();
      // Not annotated field
      if (JSONField.getString("fieldName").equals("Parent 1's First Name")) {
        matchedField = JSONField;
      }
    }
    if (matchedField == null) {
      fail("No matched field found");
    } else {
      assertEquals("", matchedField.getString("fieldDefaultValue"));
      assertEquals(false, matchedField.getBoolean("fieldIsMatched"));
      assertEquals("TextField", matchedField.getString("fieldType"));
      assertEquals(
          "Please Enter Your: Parent 1's First Name", matchedField.getString("fieldQuestion"));
    }
  }

  @Test // Test with title embedded in document
  public void getPDFTitleTest1() throws IOException {
    String fileName = "Ann_Too_Pennsylvania_Birth_Certificate.pdf";
    File applicationPDF = new File(resourcesFolderPath + File.separator + fileName);
    PDDocument pdfDocument = PDDocument.load(FileUtils.openInputStream(applicationPDF));
    assertEquals(
        "Pennsylvania - Application for a Birth Certificate",
        PdfController.getPDFTitle(fileName, pdfDocument));
  }

  @Test // Test without any title in document
  public void getPDFTitleTest2() throws IOException {
    String fileName = "library-card-application.pdf";
    File applicationPDF = new File(resourcesFolderPath + File.separator + fileName);
    PDDocument pdfDocument = PDDocument.load(FileUtils.openInputStream(applicationPDF));
    assertEquals(fileName, PdfController.getPDFTitle(fileName, pdfDocument));
  }

  @BeforeEach
  public static void clearAllDocuments() {
    String[] pdfTypes = {"FORM", "FORM", "APPLICATION"};
    boolean[] annotated = {false, true, false};
    for (int j = 0; j < pdfTypes.length; j++) {
      JSONObject body = new JSONObject();
      body.put("pdfType", pdfTypes[j]);
      body.put("annotated", annotated[j]);
      HttpResponse<String> getAllDocuments =
          Unirest.post(TestUtils.getServerUrl() + "/get-documents")
              .body(body.toString())
              .asString();
      JSONObject getAllDocumentsJSON = TestUtils.responseStringToJSON(getAllDocuments.getBody());
      assertThat(getAllDocumentsJSON.getString("status")).isEqualTo("SUCCESS");
      JSONArray arr = getAllDocumentsJSON.getJSONArray("documents");
      for (int i = 0; i < arr.length(); i++) {
        String fileId = arr.getJSONObject(i).getString("id");
        delete(fileId, pdfTypes[j]);
      }
    }
  }
}
