package PDF;

import Config.Message;
import Database.User.UserDao;
import PDF.Services.*;
import Security.EncryptionController;
import User.User;
import User.UserMessage;
import User.UserType;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.Objects;

import static User.UserController.mergeJSON;
import static com.mongodb.client.model.Filters.eq;

@Slf4j
public class PdfController {
  private MongoDatabase db;
  private UserDao userDao;
  private EncryptionController encryptionController;

  public PdfController(MongoDatabase db, UserDao userDao) {
    this.db = db;
    this.userDao = userDao;
    try {
      this.encryptionController = new EncryptionController(db);
    } catch (Exception e) {

    }
  }

  /*
  REQUIRES JSON Body with:
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "fileId": String giving id of file to be deleted
    - OPTIONAL- "targetUser": User whose file you want to access.
        - If left empty, defaults to original username.
  */
  public Handler pdfDelete =
      ctx -> {
        String username;
        String orgName;
        UserType userType;
        JSONObject req = new JSONObject(ctx.body());
        User check = userCheck(ctx.body());
        if (check == null && req.has("targetUser")) {
          ctx.result(UserMessage.USER_NOT_FOUND.toJSON().toString());
        } else {
          // TODO(xander) make this less hacky. Checks if client is in same org as worker.
          boolean orgFlag;
          if (check != null && req.has("targetUser")) {
            log.info("Target user found");
            username = check.getUsername();
            orgName = check.getOrganization();
            userType = check.getUserType();
            orgFlag = orgName.equals(ctx.sessionAttribute("orgName"));
          } else {
            username = ctx.sessionAttribute("username");
            orgName = ctx.sessionAttribute("orgName");
            userType = ctx.sessionAttribute("privilegeLevel");
            // User is in same org as themselves
            orgFlag = true;
          }

          if (orgFlag) {
            PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
            String fileIDStr = req.getString("fileId");

            DeletePDFService deletePDFService =
                new DeletePDFService(db, username, orgName, userType, pdfType, fileIDStr);
            ctx.result(deletePDFService.executeAndGetResponse().toResponseString());
          } else {
            ctx.result(UserMessage.CROSS_ORG_ACTION_DENIED.toResponseString());
          }
        }
      };

  /*
  REQUIRES JSON Body:
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "fileId": String giving id of file to be downloaded
    - OPTIONAL- "targetUser": User whose file you want to access.
        - If left empty, defaults to original username.
  */
  public Handler pdfDownload =
      ctx -> {
        String username;
        String orgName;
        UserType userType;
        JSONObject req = new JSONObject(ctx.body());
        User check = userCheck(ctx.body());
        if (check == null && req.has("targetUser")) {
          log.info("Target User not Found");
          ctx.result(UserMessage.USER_NOT_FOUND.toJSON().toString());
        } else {
          // TODO(xander) make this less hacky. Checks if client is in same org as worker.
          boolean orgFlag;
          if (check != null && req.has("targetUser")) {
            log.info("Target user found");
            username = check.getUsername();
            orgName = check.getOrganization();
            userType = check.getUserType();
            orgFlag = orgName.equals(ctx.sessionAttribute("orgName"));
          } else {
            username = ctx.sessionAttribute("username");
            orgName = ctx.sessionAttribute("orgName");
            userType = ctx.sessionAttribute("privilegeLevel");
            orgFlag = true;
          }

          if (orgFlag) {
            String fileIDStr = req.getString("fileId");

            String pdfTypeString = req.getString("pdfType");
            PDFType pdfType = PDFType.createFromString(pdfTypeString);
            DownloadPDFService downloadPDFService =
                new DownloadPDFService(
                    db, username, orgName, userType, fileIDStr, pdfType, encryptionController);
            Message response = downloadPDFService.executeAndGetResponse();
            if (response == PdfMessage.SUCCESS) {
              ctx.header("Content-Type", "application/pdf");
              ctx.result(downloadPDFService.getInputStream());
            } else {
              ctx.result(response.toResponseString());
            }
          } else {
            ctx.result(UserMessage.CROSS_ORG_ACTION_DENIED.toResponseString());
          }
        }
      };

  //  public User userCheck(JSONObject req) {
  //    String username;
  //    User user = null;
  //    if (req != null && req.has("targetUser")) {
  //      username = req.getString("targetUser");
  //      MongoCollection<User> userCollection = this.db.getCollection("user", User.class);
  //      user = userCollection.find(eq("username", username)).first();
  //    }
  //    return user;
  //  }

  public User userCheck(String req) {
    log.info("userCheck Helper started");
    String username;
    User user = null;
    try {
      JSONObject reqJson = new JSONObject(req);
      if (reqJson.has("targetUser")) {
        username = reqJson.getString("targetUser");
        MongoCollection<User> userCollection = this.db.getCollection("user", User.class);
        user = userCollection.find(eq("username", username)).first();
      }
    } catch (JSONException e) {

    }
    log.info("userCheck done");
    return user;
  }

  /*
  REQUIRES JSON Body:
    - Body
      - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
      - if "pdfType" is "FORM"
        - "annotated": boolean for retrieving EITHER annotated forms OR unannotated forms
      - OPTIONAL- "targetUser": User whose file you want to access.
        - If left empty, defaults to original username.
  */
  public Handler pdfGetDocuments =
      ctx -> {
        log.info("Starting pdfGetDocuments");
        String username;
        String orgName;
        UserType userType;
        String reqBody = ctx.body();
        JSONObject req = new JSONObject(reqBody);
        JSONObject responseJSON;
        User check = userCheck(ctx.body());
        if (check == null && req.has("targetUser")) {
          log.info("Target User not Found");
          responseJSON = UserMessage.USER_NOT_FOUND.toJSON();
        } else {
          // TODO(xander) make this less hacky. Checks if client is in same org as worker.
          boolean orgFlag;
          if (check != null && req.has("targetUser")) {
            log.info("Target user found");
            username = check.getUsername();
            orgName = check.getOrganization();
            userType = check.getUserType();
            orgFlag = orgName.equals(ctx.sessionAttribute("orgName"));
          } else {
            username = ctx.sessionAttribute("username");
            orgName = ctx.sessionAttribute("orgName");
            userType = ctx.sessionAttribute("privilegeLevel");
            orgFlag = true;
          }
          if (orgFlag) {
            // System.out.println(username + ", " + orgName + ", " + userType.toString());
            PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
            boolean annotated = false;
            if (pdfType == PDFType.FORM) {
              annotated = Objects.requireNonNull(req.getBoolean("annotated"));
            }
            GetFilesInformationPDFService getFilesInformationPDFService =
                new GetFilesInformationPDFService(
                    db, username, orgName, userType, pdfType, annotated);
            Message response = getFilesInformationPDFService.executeAndGetResponse();
            responseJSON = response.toJSON();

            if (response == PdfMessage.SUCCESS) {
              responseJSON.put("documents", getFilesInformationPDFService.getFiles());
            }
          } else {
            responseJSON = UserMessage.CROSS_ORG_ACTION_DENIED.toJSON();
          }
        }
        ctx.result(responseJSON.toString());
      };

  /*
  REQUIRES 2 fields in HTTP Request
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "file": the PDF file to be uploaded
  Additional support for uploading on behalf of another user, JSON body:
    - "targetUser": the user the file is being uploaded for
   */
  public Handler pdfUpload =
      ctx -> {
        log.info("pdfUpload");
        String username;
        String organizationName;
        UserType privilegeLevel;
        Message response;
        UploadedFile file = ctx.uploadedFile("file");
        JSONObject req;
        String body = ctx.body();
        try {
          req = new JSONObject(body);
        } catch (JSONException e) {
          req = null;
        }
        User check = userCheck(body);
        if (req != null && req.has("targetUser") && check == null) {
          log.info("Target User could not be found in the database");
          response = UserMessage.USER_NOT_FOUND;
        } else {
          boolean orgFlag;
          if (req != null && req.has("targetUser") && check != null) {
            log.info("Target User found, setting parameters.");
            username = check.getUsername();
            organizationName = check.getOrganization();
            privilegeLevel = check.getUserType();
            orgFlag = organizationName.equals(ctx.sessionAttribute("orgName"));
          } else {
            username = ctx.sessionAttribute("username");
            organizationName = ctx.sessionAttribute("orgName");
            privilegeLevel = ctx.sessionAttribute("privilegeLevel");
            orgFlag = true;
          }
          // System.out.println(username + ", " + organizationName + ", " + privilegeLevel);

          if (orgFlag) {
            if (file == null) {
              log.info("File is null, invalid pdf");
              response = PdfMessage.INVALID_PDF;
            } else {
              PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
              // TODO: Replace with a title that is retrieved from the client (optionally)
              String title = null;
              try {
                InputStream content = file.getContent();
                PDDocument pdfDocument = PDDocument.load(content);
                title = getPDFTitle(file.getFilename(), pdfDocument);
                content.reset();
                pdfDocument.close();
              } catch (Exception exception) {
                ctx.result(PdfMessage.INVALID_PDF.toResponseString());
              }
              UploadPDFService uploadService =
                  new UploadPDFService(
                      db,
                      username,
                      organizationName,
                      privilegeLevel,
                      pdfType,
                      file.getFilename(),
                      title,
                      file.getContentType(),
                      file.getContent(),
                      encryptionController);
              response = uploadService.executeAndGetResponse();
            }
          } else {
            response = UserMessage.CROSS_ORG_ACTION_DENIED;
          }
        }
        ctx.result(response.toResponseString());
      };

  /*
  REQUIRES 2 fields in HTTP Request
    - "fileID": fileID to replace
    - "file": the PDF file to be uploaded
   */
  public Handler pdfUploadAnnotated =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");

        UploadedFile file = ctx.uploadedFile("file");
        String fileIDStr = ctx.formParam("fileId");
        UploadAnnotatedPDFService uploadService =
            new UploadAnnotatedPDFService(
                db,
                username,
                organizationName,
                privilegeLevel,
                fileIDStr,
                file.getFilename(),
                file.getContentType(),
                file.getContent(),
                encryptionController);
        ctx.result(uploadService.executeAndGetResponse().toResponseString());
      };

  /*
  REQUIRES 3 fields in HTTP Request
    - "pdfType": String giving PDF Type ("FORM", "APPLICATION", "IDENTIFICATION")
    - "file": the PDF file to be uploaded
    - "signature": the signature image to place in the file
   */
  public Handler pdfSignedUpload =
      ctx -> {
        String username = Objects.requireNonNull(ctx.sessionAttribute("username"));
        String organizationName = Objects.requireNonNull(ctx.sessionAttribute("orgName"));
        UserType privilegeLevel = Objects.requireNonNull(ctx.sessionAttribute("privilegeLevel"));

        // Params
        UploadedFile file = Objects.requireNonNull(ctx.uploadedFile("file"));
        UploadedFile signature = Objects.requireNonNull(ctx.uploadedFile("signature"));
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));

        UploadSignedPDFService uploadService =
            new UploadSignedPDFService(
                db,
                username,
                organizationName,
                privilegeLevel,
                pdfType,
                file.getFilename(),
                file.getContentType(),
                file.getContent(),
                signature.getContent(),
                encryptionController);
        ctx.result(uploadService.executeAndGetResponse().toResponseString());
      };

  /*
  REQUIRES JSON Body:
    - "applicationId": String giving id of application to get questions from
   */
  public Handler getApplicationQuestions =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String applicationId = req.getString("applicationId");
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        DownloadPDFService downloadPDFService =
            new DownloadPDFService(
                db,
                username,
                organizationName,
                privilegeLevel,
                applicationId,
                PDFType.FORM,
                encryptionController);
        Message responseDownload = downloadPDFService.executeAndGetResponse();
        if (responseDownload == PdfMessage.SUCCESS) {
          InputStream inputStream = downloadPDFService.getInputStream();
          GetQuestionsPDFService getQuestionsPDFService =
              new GetQuestionsPDFService(userDao, privilegeLevel, username, inputStream);
          Message response = getQuestionsPDFService.executeAndGetResponse();
          if (response == PdfMessage.SUCCESS) {
            JSONObject information = getQuestionsPDFService.getApplicationInformation();
            ctx.result(mergeJSON(response.toJSON(), information).toString());
          } else {
            ctx.result(response.toJSON().toString());
          }
        } else {
          ctx.result(responseDownload.toResponseString());
        }
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
        String applicationId = req.getString("applicationId");
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject formAnswers = req.getJSONObject("formAnswers");

        DownloadPDFService downloadPDFService =
            new DownloadPDFService(
                db,
                username,
                organizationName,
                privilegeLevel,
                applicationId,
                PDFType.FORM,
                encryptionController);
        Message responseDownload = downloadPDFService.executeAndGetResponse();
        if (responseDownload == PdfMessage.SUCCESS) {
          InputStream inputStream = downloadPDFService.getInputStream();
          FillPDFService fillPDFService =
              new FillPDFService(db, privilegeLevel, inputStream, formAnswers);
          Message response = fillPDFService.executeAndGetResponse();
          if (response == PdfMessage.SUCCESS) {
            ctx.header("Content-Type", "application/pdf");
            ctx.result(fillPDFService.getCompletedForm());
          } else {
            ctx.result(response.toResponseString());
          }
        } else {
          ctx.result(responseDownload.toResponseString());
        }
      };

  public static String getPDFTitle(String fileName, PDDocument pdfDocument) {
    String title = fileName;
    pdfDocument.setAllSecurityToBeRemoved(true);
    String titleTmp = pdfDocument.getDocumentInformation().getTitle();
    if (titleTmp != null) {
      title = titleTmp;
    }
    return title;
  }
}
