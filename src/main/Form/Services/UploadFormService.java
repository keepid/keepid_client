package Form.Services;

import Config.Message;
import Config.Service;
import Form.FormMessage;
import Form.FormType;
import Security.EncryptionController;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import org.bson.Document;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.time.LocalDate;

public class UploadFormService implements Service {
  public static final int CHUNK_SIZE_BYTES = 100000;

  String uploader;
  String organizationName;
  UserType privilegeLevel;
  String filename;
  String title;
  String fileContentType;
  InputStream fileStream;
  FormType formType;
  MongoDatabase db;
  EncryptionController encryptionController;

  public UploadFormService(
      MongoDatabase db,
      String uploaderUsername,
      String organizationName,
      UserType privilegeLevel,
      FormType formType,
      String filename,
      String title,
      String fileContentType,
      InputStream fileStream,
      EncryptionController encryptionController) {
    this.db = db;
    this.uploader = uploaderUsername;
    this.organizationName = organizationName;
    this.privilegeLevel = privilegeLevel;
    this.formType = formType;
    this.filename = filename;
    this.title = title;
    this.fileContentType = fileContentType;
    this.fileStream = fileStream;
    this.encryptionController = encryptionController;
  }

  @Override
  public Message executeAndGetResponse() {
    if (formType == null) {
      return FormMessage.INVALID_FORM_TYPE;
    } else if (fileStream == null) {
      return FormMessage.INVALID_FORM;
    } else if (!fileContentType.equals("application/form")
        && !fileContentType.equals("application/octet-stream")) {
      return FormMessage.INVALID_FORM;
    } else {
      if ((formType == FormType.APPLICATION
              || formType == FormType.IDENTIFICATION
              || formType == FormType.FORM)
          && (privilegeLevel == UserType.Client
              || privilegeLevel == UserType.Worker
              || privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Developer)) {
        try {
          return mongodbUpload(
              uploader, organizationName, filename, title, fileStream, formType, db);
        } catch (GeneralSecurityException | IOException e) {
          return FormMessage.SERVER_ERROR;
        }
      } else {
        return FormMessage.INSUFFICIENT_PRIVILEGE;
      }
    }
  }

  public Message mongodbUpload(
      String uploader,
      String organizationName,
      String filename,
      String title,
      InputStream inputStream,
      FormType formType,
      MongoDatabase db)
      throws GeneralSecurityException, IOException {
    inputStream = encryptionController.encryptFile(inputStream, uploader);
    GridFSBucket gridBucket = GridFSBuckets.create(db, formType.toString());
    GridFSUploadOptions options;
    if (formType == FormType.FORM) {
      options =
          new GridFSUploadOptions()
              .chunkSizeBytes(CHUNK_SIZE_BYTES)
              .metadata(
                  new Document("type", "form")
                      .append("upload_date", String.valueOf(LocalDate.now()))
                      .append("title", title)
                      .append("annotated", false)
                      .append("uploader", uploader)
                      .append("organizationName", organizationName));

    } else {
      options =
          new GridFSUploadOptions()
              .chunkSizeBytes(CHUNK_SIZE_BYTES)
              .metadata(
                  new Document("type", "form")
                      .append("upload_date", String.valueOf(LocalDate.now()))
                      .append("uploader", uploader)
                      .append("organizationName", organizationName));
    }
    gridBucket.uploadFromStream(filename, inputStream, options);
    return FormMessage.SUCCESS;
  }
}
