package PDFTest;

import Security.EncryptionController;
import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.commons.io.FileUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.LinkedList;

import static PDF.PdfControllerHelper.getFieldValues;
import static org.assertj.core.api.Assertions.assertThat;

public class PdfMongoTests {
  private static EncryptionController encryptionController;
  private static String username;

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
    TestUtils.setUpTestDB();
    username = "adminBSM";
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
    delete(idString);
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

  @Test
  public void uploadDocxTest() {
    TestUtils.login(username, username);
    File exampleDocx = new File(resourcesFolderPath + File.separator + "job_description.docx");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload")
            .header("Content-Disposition", "attachment")
            .field("pdfType", "APPLICATION")
            .field("file", exampleDocx)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("INVALID_PDF");
    TestUtils.logout();
  }

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

    delete(fileId, "FORM");
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

    delete(fileId, "FORM");
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
  public void getApplicationQuestionsBirthCertificateTest()
      throws IOException, GeneralSecurityException {
    TestUtils.login(username, username);
    // when running entire file, other documents interfere with retrieving the form.
    clearAllDocuments();

    File applicationPDF =
        new File(resourcesFolderPath + File.separator + "Application_for_a_Birth_Certificate.pdf");
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

    delete(fileId, "FORM");
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

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(applicationsQuestionsResponseJSON.getJSONArray("fields").toString())
        .isEqualTo(new JSONArray().toString());
    delete(fileId, "FORM");
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
      fieldValues = getFieldValues(pdf);
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
      fieldValues = getFieldValues(pdf);
    } catch (IOException e) {
      assertThat(false).isTrue();
    }
    assertThat(fieldValues).isNotNull();
    checkFormAnswersSS5Form(fieldValues);
    delete(fileId, "FORM");
    TestUtils.logout();
  }

  public static JSONObject getFormAnswersTestPDFForm(JSONObject responseJSON) {
    JSONObject formAnswers = new JSONObject();
    JSONArray fields = responseJSON.getJSONArray("fields");
    for (int i = 0; i < fields.length(); i++) {
      JSONObject field = fields.getJSONObject(i);
      if (field.getString("fieldType").equals("TextField")) {
        if (field.getString("fieldName").equals("currentdate_af_date")) {
          formAnswers.put(field.getString("fieldName"), "7/14/20");
        } else {
          formAnswers.put(field.getString("fieldName"), "1");
        }
      } else if ((field.getString("fieldType").equals("CheckBox"))) {
        if (field.getString("fieldName").equals("Ribeye Steaks")) {
          formAnswers.put(field.getString("fieldName"), false);
        } else {
          formAnswers.put(field.getString("fieldName"), true);
        }
      } else if ((field.getString("fieldType").equals("PushButton"))) {
        formAnswers.put(field.getString("fieldName"), true);
      } else if ((field.getString("fieldType").equals("RadioButton"))) {
        formAnswers.put(field.getString("fieldName"), "Yes");
      } else if ((field.getString("fieldType").equals("ComboBox"))) {
        formAnswers.put(field.getString("fieldName"), "Choice2");
      } else if ((field.getString("fieldType").equals("ListBox"))) {
        JSONArray l = new JSONArray();
        l.put("Choice2");
        formAnswers.put(field.getString("fieldName"), l);
      } else if ((field.getString("fieldType").equals("SignatureField"))) {
        formAnswers.put(field.getString("fieldName"), new PDSignature());
      }
    }
    return formAnswers;
  }

  public static void checkFormAnswersTestPDFForm(JSONObject fieldValues) {
    for (String s : fieldValues.keySet()) {
      String value = "";
      if (s.contains("Signature") || s.equals("Submit")) {
        value = "";
      } else if (s.equals("Combobox") || s.equals("Dropdown")) {
        value = "[Choice2]";
      } else if (s.equals("Tomatoes")
          || s.equals("Ribeye Steaks")
          || s.equals("Chicken")
          || s.equals("Vegetables")
          || s.equals("Radiobuttons")) {
        value = "Yes";
        if (s.equals("Ribeye Steaks")) {
          value = "Off";
        }
      } else if (s.equals("currentdate_af_date")) {
        value = "7/14/20";
      } else { // all text fields
        value = "1";
      }
      assertThat(fieldValues.get(s)).isEqualTo(value);
    }
  }

  public static void checkFormAnswersSS5Form(JSONObject fieldValues) {
    for (String s : fieldValues.keySet()) {
      String value = "";
      boolean isText = false;
      if (s.equals("Signature") || s.equals("Submit")) {
        value = "";
      } else if (s.equals("Combobox") || s.equals("Dropdown")) {
        value = "[Choice2]";
      } else if (s.equals("Tomatoes")
          || s.equals("Ribeye Steaks")
          || s.equals("Chicken")
          || s.equals("Vegetables")
          || s.equals("Radiobuttons")) {
        value = "Yes";
        if (s.equals("Ribeye Steaks")) {
          value = "Off";
        }
      } else if (s.equals("currentdate_af_date")) {
        value = "7/14/20";
      } else { // all text fields
        value = "1";
        isText = true;
      }
      if (!isText) {
        assertThat(fieldValues.get(s)).isEqualTo(value);
      } else {
        // do nothing. too many text fields that can't be any value.
      }
    }
  }

  public static String uploadFileAndGetFileId(File file, String pdfType)
      throws IOException, GeneralSecurityException {
    // upload file
    EncryptionController encryptionController = TestUtils.getEncryptionController();
    InputStream fileStream = FileUtils.openInputStream(file);

    File tmp = File.createTempFile("test1", "tmp");
    FileUtils.copyInputStreamToFile(encryptionController.encryptFile(fileStream, username), tmp);
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

  public static void delete(String id, String pdfType) {
    JSONObject body = new JSONObject();
    body.put("pdfType", pdfType);
    body.put("fileId", id);
    HttpResponse<String> deleteResponse =
        Unirest.post(TestUtils.getServerUrl() + "/delete-document")
            .body(body.toString())
            .asString();
    JSONObject deleteResponseJSON = TestUtils.responseStringToJSON(deleteResponse.getBody());
    assertThat(deleteResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  @BeforeEach
  public static void clearAllDocuments() {
    //    String[] pdfTypes = {"FORM", "FORM", "APPLICATION"};
    //    boolean[] annotated = {false, true, false};
    //    for (int j = 0; j < pdfTypes.length; j++) {
    //      JSONObject body = new JSONObject();
    //      body.put("pdfType", pdfTypes[j]);
    //      body.put("annotated", annotated[j]);
    //      HttpResponse<String> getAllDocuments =
    //          Unirest.post(TestUtils.getServerUrl() + "/get-documents")
    //              .body(body.toString())
    //              .asString();
    //      JSONObject getAllDocumentsJSON =
    // TestUtils.responseStringToJSON(getAllDocuments.getBody());
    //      assertThat(getAllDocumentsJSON.getString("status")).isEqualTo("SUCCESS");
    //      JSONArray arr = getAllDocumentsJSON.getJSONArray("documents");
    //      for (int i = 0; i < arr.length(); i++) {
    //        String fileId = arr.getJSONObject(i).getString("id");
    //        delete(fileId, pdfTypes[j]);
    //      }
    //    }
  }

  public static void uploadTestPDF() {
    File examplePDF =
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");

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
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
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
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
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
    assertThat(getFormJSON.getJSONArray("documents").getJSONObject(0).getBoolean("annotated"))
        .isEqualTo(false);
    String fileId = getFormJSON.getJSONArray("documents").getJSONObject(0).getString("id");

    // reupload same form, now annotated
    examplePDF =
        new File(resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
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
    return getAllDocumentsJSON;
  }
}
