package PDFTest;

import PDF.PdfController;
import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
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
  public void getApplicationQuestionsMediaReleaseTest() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationPDF =
        new File(resourcesFolderPath + File.separator + "Media_Release_fillable.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    System.out.println(applicationsQuestionsResponseJSON.toString());

    // comb through JSON for each field, to see if it is there.
    LinkedList<String[][]> fieldsToCheck = new LinkedList<String[][]>();
    // each array has format {{fieldType}, {fieldName} {fieldValueOptions}}
    String[][] street = {{"TextField"}, {"Production Title"}, {}};
    fieldsToCheck.add(street);
    checkForFields(applicationsQuestionsResponseJSON, fieldsToCheck);
  }

  @Test
  public void getApplicationQuestionsSS5Test() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationPDF = new File(resourcesFolderPath + File.separator + "ss-5.pdf");
    String fileId = uploadFileAndGetFileId(applicationPDF, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");

    System.out.println(applicationsQuestionsResponseJSON.toString());
  }

  @Test
  public void getApplicationQuestionBlankPDFTest() {
    TestUtils.login("adminBSM", "adminBSM");
    // when running entire file, other documents interfere with retrieving the form.
    reset();

    File applicationDocx =
        new File(currentPDFFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf");
    String fileId = uploadFileAndGetFileId(applicationDocx, "FORM");

    JSONObject body = new JSONObject();
    body.put("applicationId", fileId);
    HttpResponse<String> applicationsQuestionsResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-questions").body(body.toString()).asString();
    JSONObject applicationsQuestionsResponseJSON =
        TestUtils.responseStringToJSON(applicationsQuestionsResponse.getBody());

    assertThat(applicationsQuestionsResponseJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(applicationsQuestionsResponseJSON.getJSONArray("fields").toString())
        .isEqualTo(new JSONArray().toString());
  }

  @Test
  public void fillApplicationQuestionsTestPDFTest() {
    TestUtils.login("adminBSM", "adminBSM");
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

    System.out.println(applicationsQuestionsResponseJSON.toString());

    JSONObject formAnswers = getFormAnswersTestPDFForm(applicationsQuestionsResponseJSON);
    System.out.println(formAnswers.toString());

    // fill out form
    body = new JSONObject();
    body.put("applicationId", fileId);
    body.put("formAnswers", formAnswers);
    HttpResponse<File> filledForm =
        Unirest.post(TestUtils.getServerUrl() + "/fill-application")
            .body(body.toString())
            .asFile(resourcesFolderPath + File.separator + "testpdf_filled_out.pdf");
    System.out.println(filledForm.getStatus());
    assertThat(filledForm.getStatus()).isEqualTo(200);

    // check if all fields are filled
    JSONObject fieldValues = null;
    try {
      File filled_out_pdf =
          new File(resourcesFolderPath + File.separator + "testpdf_filled_out.pdf");
      PDDocument pdf = PDDocument.load(filled_out_pdf);
      fieldValues = PdfController.getFieldValues(pdf);
      System.out.println(fieldValues.toString());
    } catch (IOException e) {
      assertThat(false).isTrue();
    }
    assertThat(fieldValues).isNotNull();
    checkFormAnswersTestPDFForm(fieldValues);
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
          formAnswers.put(field.getString("fieldName"), "test");
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
      System.out.println(s);
      String value = "";
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
        value = "test";
      }
      assertThat(fieldValues.get(s)).isEqualTo(value);
    }
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
