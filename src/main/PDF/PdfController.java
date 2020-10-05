package PDF;

import Security.EncryptionController;
import User.UserType;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import static PDF.PdfControllerHelper.*;

public class PdfController {
  private MongoDatabase db;
  private EncryptionController encryptionController;

  public PdfController(MongoDatabase db, EncryptionController encryptionController) {
    this.db = db;
    this.encryptionController = encryptionController;
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

  /*
  REQUIRES JSON Body with:
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "fileId": String giving id of file to be deleted
  */
  public Handler pdfDelete =
      ctx -> {
        String user = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType =
            Objects.requireNonNull(PDFType.createFromString(req.getString("pdfType")));
        String fileIDStr = Objects.requireNonNull(req.getString("fileId"));

        if (pdfType == null) {
          ctx.json(PdfMessage.INVALID_PDF_TYPE.toJSON());
          return;
        } else if (!ValidationUtils.isValidObjectId(fileIDStr)) {
          ctx.json(PdfMessage.INVALID_PARAMETER.toJSON());
          return;
        }
        ObjectId fileID = new ObjectId(fileIDStr);
        JSONObject res =
            PdfMongo.delete(user, organizationName, pdfType, privilegeLevel, fileID, db);
        ctx.json(res.toString());
      };

  /*
  REQUIRES JSON Body:
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "fileId": String giving id of file to be downloaded
  */
  public Handler pdfDownload =
      ctx -> {
        String user = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        JSONObject req = new JSONObject(ctx.body());
        String fileIDStr = Objects.requireNonNull(req.getString("fileId"));
        PDFType pdfType =
            Objects.requireNonNull(PDFType.createFromString(req.getString("pdfType")));
        ObjectId fileID = new ObjectId(fileIDStr);

        if (pdfType == null) {
          ctx.result("Invalid PDFType");
        } else {
          InputStream stream =
              PdfMongo.download(
                  user,
                  organizationName,
                  privilegeLevel,
                  fileID,
                  pdfType,
                  db,
                  encryptionController);
          if (stream != null) {
            ctx.header("Content-Type", "application/pdf");
            ctx.result(stream);
          } else {
            ctx.result("Error");
          }
        }
      };

  /*
  REQUIRES JSON Body:
    - Body
      - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
      - if "pdfType" is "FORM"
        - "annotated": boolean for retrieving EITHER annotated forms OR unannotated forms
  */
  public Handler pdfGetAll =
      ctx -> {
        String user = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType =
            Objects.requireNonNull(PDFType.createFromString(req.getString("pdfType")));
        JSONObject res;

        if (pdfType == null) {
          res = PdfMessage.INVALID_PDF_TYPE.toJSON();
        } else if (pdfType == PDFType.FORM) {
          boolean getUnannotatedForms = Objects.requireNonNull(req.getBoolean("annotated"));
          res =
              PdfMongo.getAllFiles(
                  user,
                  organizationName,
                  privilegeLevel,
                  pdfType,
                  getUnannotatedForms,
                  encryptionController,
                  db);
        } else {
          res =
              PdfMongo.getAllFiles(
                  user, organizationName, privilegeLevel, pdfType, false, encryptionController, db);
        }
        ctx.json(res.toString());
      };

  /*
  REQUIRES 2 fields in HTTP Request
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "file": the PDF file to be uploaded
   */
  public Handler pdfUpload =
      ctx -> {
        String username = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));
        UploadedFile file = ctx.uploadedFile("file");
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
        String fileIDStr = ctx.formParam("fileId");
        JSONObject res;
        ObjectId fileID;

        if (pdfType == null) {
          res = PdfMessage.INVALID_PDF_TYPE.toJSON();
        } else if (file == null) {
          res = PdfMessage.INVALID_PDF.toJSON();
        } else if (file.getExtension().equals(".pdf")) {
          if (fileIDStr != null) {
            fileID = new ObjectId(fileIDStr);
          } else {
            fileID = null;
          }
          res =
              PdfMongo.upload(
                  username,
                  organizationName,
                  privilegeLevel,
                  file.getFilename(),
                  fileID,
                  pdfType,
                  file.getContent(),
                  this.db,
                  encryptionController);
        } else {
          res = PdfMessage.INVALID_PDF.toJSON();
        }
        ctx.json(res.toString());
      };

  public Handler pdfSignedUpload =
      ctx -> {
        String username = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        // Params
        UploadedFile file = Objects.requireNonNull(ctx.uploadedFile("file"));
        UploadedFile signature = Objects.requireNonNull(ctx.uploadedFile("signature"));
        PDFType pdfType =
            Objects.requireNonNull(PDFType.createFromString(ctx.formParam("pdfType")));

        JSONObject res;
        if (pdfType == null) {
          res = PdfMessage.INVALID_PDF_TYPE.toJSON();
        } else if (file == null) {
          res = PdfMessage.INVALID_PDF.toJSON();
        } else if (file.getContentType().equals("application/pdf")
            || (file.getContentType().equals("application/octet-stream"))) {

          InputStream pdfSigned = signPDF(username, file.getContent(), signature.getContent());
          res =
              PdfMongo.upload(
                  username,
                  organizationName,
                  privilegeLevel,
                  file.getFilename(),
                  null,
                  pdfType,
                  pdfSigned,
                  this.db,
                  encryptionController);
        } else {
          res = PdfMessage.INVALID_PDF.toJSON();
        }
        ctx.json(res.toString());
      };

  /*
  REQUIRES JSON Body:
    - "applicationId": String giving id of application to get questions from
   */
  public Handler getApplicationQuestions =
      ctx -> {
        String username = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        JSONObject req = new JSONObject(ctx.body());
        String applicationIdString = Objects.requireNonNull(req.getString("applicationId"));
        ObjectId applicationId = new ObjectId(applicationIdString);

        InputStream inputStream =
            PdfMongo.download(
                username,
                organizationName,
                privilegeLevel,
                applicationId,
                PDFType.FORM,
                db,
                encryptionController);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);
        pdfDocument.close();

        JSONObject allFields = PdfMessage.SUCCESS.toJSON();
        allFields.put("fields", new JSONArray(fieldsJSON));
        ctx.json(allFields.toString());
      };

  /*
  REQUIRES JSON Body:
    - "applicationId": String giving id of application to fill out
    - "formAnswers": JSON with format
      {
        "Field1 Name": Field 1's Answer,
        "Field2 Name": Field 2's Answer,
        ...
      }
   */
  public Handler fillPDFForm =
      ctx -> {
        String username = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        JSONObject req = new JSONObject(ctx.body());
        String applicationIdString = Objects.requireNonNull(req.getString("applicationId"));
        JSONObject formAnswers = Objects.requireNonNull(req.getJSONObject("formAnswers"));
        ObjectId applicationId = new ObjectId(applicationIdString);

        InputStream inputStream =
            PdfMongo.download(
                username,
                organizationName,
                privilegeLevel,
                applicationId,
                PDFType.FORM,
                db,
                encryptionController);
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
}
