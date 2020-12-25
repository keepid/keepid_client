package PDFTest;

import Security.EncryptionUtils;
import TestUtils.TestUtils;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.commons.io.FileUtils;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.LinkedList;

import static org.assertj.core.api.Assertions.assertThat;

public class PdfControllerIntegrationTestHelperMethods {
  private static String resourcesFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "resources";

  public static void checkForFields(
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
    EncryptionUtils encryptionUtils = TestUtils.getEncryptionUtils();
    InputStream fileStream = FileUtils.openInputStream(file);

    File tmp = File.createTempFile("test1", "tmp");
    FileUtils.copyInputStreamToFile(
        encryptionUtils.encryptFile(fileStream, PdfControllerIntegrationTests.username), tmp);
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

  public static JSONObject searchTestPDF() {
    JSONObject body = new JSONObject();
    body.put("pdfType", "APPLICATION");
    HttpResponse<String> getAllDocuments =
        Unirest.post(TestUtils.getServerUrl() + "/get-documents").body(body.toString()).asString();
    JSONObject getAllDocumentsJSON = TestUtils.responseStringToJSON(getAllDocuments.getBody());
    assertThat(getAllDocumentsJSON.getString("status")).isEqualTo("SUCCESS");
    return getAllDocumentsJSON;
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
        Unirest.post(TestUtils.getServerUrl() + "/upload-annotated")
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
}
