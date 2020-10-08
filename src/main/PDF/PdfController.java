package PDF;

import Security.EncryptionUtils;
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
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import static PDF.PdfControllerHelper.*;

public class PdfController {
  private MongoDatabase db;
  private EncryptionUtils encryptionUtils;
  private Logger logger;

  public PdfController(MongoDatabase db) {
    this.db = db;
    this.encryptionUtils = EncryptionUtils.getInstance();
    LogFactory l = new LogFactory();
    this.logger = l.createLogger("PdfController");
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

  /*
  REQUIRES JSON Body:
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "fileId": String giving id of file to be downloaded
  */
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

  /*
  REQUIRES JSON Body:
    - Body
      - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
      - if "pdfType" is "FORM"
        - "annotated": boolean for retrieving EITHER annotated forms OR unannotated forms
  */
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

  /*
  REQUIRES 2 fields in HTTP Request
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "file": the PDF file to be uploaded
   */
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
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        InputStream inputStream =
            DownloadPDFService.download(
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        List<JSONObject> fieldsJSON = getFieldInformation(pdfDocument);
        pdfDocument.close();
        ctx.result(fieldsJSON.toString());
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
}
