package PDF;

import Logger.LogFactory;
import PDF.Services.DeletePDFService;
import PDF.Services.DownloadPDFService;
import PDF.Services.GetAllPdfFilesService;
import PDF.Services.UploadPDFService;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

public class PdfController {
  private MongoDatabase db;
  private Logger logger;

  public PdfController(MongoDatabase db) {
    this.db = db;
    LogFactory l = new LogFactory();
    this.logger = l.createLogger("PdfController");
  }

  public Handler pdfDelete =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        String fileIDStr = req.getString("fileId");
        String username = ctx.sessionAttribute("username");
        String orgName = ctx.sessionAttribute("orgName");
        UserType userType = ctx.sessionAttribute("privilegeLevel");

        DeletePDFService deletePDFService =
            new DeletePDFService(db, logger, username, orgName, userType, pdfType, fileIDStr);
        ctx.result(deletePDFService.executeAndGetResponse().toResponseString());
      };

  public Handler pdfDownload =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String orgName = ctx.sessionAttribute("orgName");
        UserType userType = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        String fileIDStr = req.getString("fileID");
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        DownloadPDFService downloadPDFService =
            new DownloadPDFService(db, logger, username, orgName, userType, fileIDStr, pdfType);
        if (downloadPDFService.executeAndGetResponse() == PdfMessage.SUCCESS) {
          ctx.header("Content-Type", "application/pdf");
          ctx.result(downloadPDFService.getInputStream());
        } else {
          ctx.result("Error");
        }
      };

  public Handler pdfGetAll =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String orgName = ctx.sessionAttribute("orgName");
        UserType userType = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        GetAllPdfFilesService getAllPdfFilesService =
            new GetAllPdfFilesService(db, logger, username, orgName, userType, pdfType);
        JSONObject res = getAllPdfFilesService.executeAndGetResponse().toJSON();
        if (getAllPdfFilesService.executeAndGetResponse() == PdfMessage.SUCCESS) {
          res.put("documents", getAllPdfFilesService.getFiles());
        }
        ctx.result(res.toString());
      };

  public Handler pdfUpload =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        UploadedFile file = ctx.uploadedFile("file");
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
        UploadPDFService uploadService =
            new UploadPDFService(
                db, logger, username, organizationName, privilegeLevel, pdfType, file);
        ctx.result(uploadService.executeAndGetResponse().toResponseString());
      };

  public Handler getApplicationQuestions =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        InputStream inputStream =
            DownloadPDFService.download(
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        List<JSONObject> fieldsJSON = new LinkedList<>();
        getFieldInformation(pdfDocument, fieldsJSON);
        pdfDocument.close();
        ctx.result(fieldsJSON.toString());
      };

  /*
   @Param fieldsJSON is an empty List of JSON, pdfDocument is the document
  */
  public static void getFieldInformation(PDDocument pdfDocument, List<JSONObject> fieldsJSON) {
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    List<PDField> fields = acroForm.getFields();
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        JSONObject fieldJSON = new JSONObject();
        String fieldType = "";
        String fieldValueOptions = "[]";
        if (field instanceof PDButton) {
          if (field instanceof PDCheckBox) {
            fieldType = "CheckBox";
          } else if (field instanceof PDPushButton) {
            fieldType = "PushButton";
          } else if (field instanceof PDRadioButton) {
            fieldType = "RadioButton";
            PDRadioButton radioButtonField = (PDRadioButton) field;
            JSONArray optionsJSONArray = new JSONArray();
            for (String choice : radioButtonField.getOnValues()) {
              optionsJSONArray.put(choice);
            }
            fieldValueOptions = optionsJSONArray.toString();
          }
        } else if (field instanceof PDVariableText) {
          if (field instanceof PDChoice) {
            if (field instanceof PDComboBox) {
              fieldType = "ComboBox";
            } else if (field instanceof PDListBox) {
              fieldType = "ListBox";
            }
            PDChoice choiceField = (PDChoice) field;
            JSONArray optionsJSONArray = new JSONArray();
            for (String choice : choiceField.getOptions()) {
              optionsJSONArray.put(choice);
            }
            fieldValueOptions = optionsJSONArray.toString();
          } else if (field instanceof PDTextField) {
            fieldType = "TextField";
          }
        } else if (field instanceof PDSignatureField) {
          fieldType = "SignatureField";
        }

        // Not Editable
        fieldJSON.put("fieldName", field.getFullyQualifiedName());
        fieldJSON.put("fieldType", fieldType);
        fieldJSON.put("fieldValueOptions", fieldValueOptions);

        // Editable
        fieldJSON.put("fieldQuestion", "Please Enter Your " + field.getPartialName());
        fieldJSON.put("fieldMatchedDBVariable", "");
        fieldJSON.put("fieldMatchedDBName", "");

        fieldsJSON.add(fieldJSON);
      }
      fields.remove(0);
    }
  }

  public Handler fillPDFForm =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject formAnswers = req.getJSONObject("formAnswers");

        InputStream inputStream =
            DownloadPDFService.download(
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        try {
          fillFields(pdfDocument, formAnswers);
        } catch (IOException exception) {
          ctx.result("failure");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfDocument.save(outputStream);
        pdfDocument.close();

        InputStream outputFileStream = new ByteArrayInputStream(outputStream.toByteArray());
        ctx.header("Content-Type", "application/pdf");
        ctx.result(outputFileStream);
      };

  public static void fillFields(PDDocument pdfDocument, JSONObject formAnswers) throws IOException {
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    for (String fieldName : formAnswers.keySet()) {
      PDField field = acroForm.getField(fieldName);
      if (field instanceof PDTextField) {
        String value = formAnswers.getString(fieldName);
        field.setValue(value);
      }
    }
  }

  public static Set<String> validFieldTypes =
      new HashSet<>(
          Arrays.asList(
              "CheckBox",
              "PushButton",
              "RadioButton",
              "ComboBox",
              "ListBox",
              "TextField",
              "SignatureField"));
}
