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
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Objects;

public class DownloadFormService implements Service {
  MongoDatabase db;
  private String username;
  private String orgName;
  private UserType privilegeLevel;
  private FormType formType;
  private String fileId;
  private InputStream inputStream;
  private EncryptionController encryptionController;

  public DownloadFormService(
      MongoDatabase db,
      String username,
      String orgName,
      UserType privilegeLevel,
      String fileId,
      FormType formType,
      EncryptionController encryptionController) {
    this.db = db;
    this.username = username;
    this.orgName = orgName;
    this.privilegeLevel = privilegeLevel;
    this.formType = formType;
    this.fileId = fileId;
    this.encryptionController = encryptionController;
  }

  @Override
  public Message executeAndGetResponse() {
    ObjectId fileID = new ObjectId(fileId);
    if (formType == null) {
      return FormMessage.INVALID_FORM;
    }
    if (privilegeLevel == UserType.Client
        || privilegeLevel == UserType.Worker
        || privilegeLevel == UserType.Director
        || privilegeLevel == UserType.Admin) {
      try {
        return download(username, orgName, privilegeLevel, fileID, formType, db);
      } catch (Exception e) {
        return FormMessage.ENCRYPTION_ERROR;
      }

    } else {
      return FormMessage.INSUFFICIENT_PRIVILEGE;
    }
  }

  public InputStream getInputStream() {
    Objects.requireNonNull(inputStream);
    return inputStream;
  }

  public Message download(
      String user,
      String organizationName,
      UserType privilegeLevel,
      ObjectId id,
      FormType formType,
      MongoDatabase db)
      throws GeneralSecurityException, IOException {
    GridFSBucket gridBucket = GridFSBuckets.create(db, formType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return FormMessage.NO_SUCH_FILE;
    }
    if (formType == FormType.APPLICATION
        && (privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        this.inputStream =
            encryptionController.decryptFile(gridBucket.openDownloadStream(id), user);
        return FormMessage.SUCCESS;
      }
    } else if (formType == FormType.IDENTIFICATION
        && (privilegeLevel == UserType.Client || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        this.inputStream =
            encryptionController.decryptFile(gridBucket.openDownloadStream(id), user);
        return FormMessage.SUCCESS;
      }
    } else if (formType == FormType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        this.inputStream =
            encryptionController.decryptFile(gridBucket.openDownloadStream(id), user);
        return FormMessage.SUCCESS;
      }
    }
    return FormMessage.INVALID_FORM_TYPE;
  }
}
