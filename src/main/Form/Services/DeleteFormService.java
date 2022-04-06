package Form.Services;

import Config.Message;
import Config.Service;
import Database.Form.FormDao;
import Form.FormMessage;
import Form.FormType;
import User.UserType;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;

public class DeleteFormService implements Service {
  FormDao formDao;
  MongoDatabase db;
  private String username;
  private String orgName;
  private UserType userType;
  private FormType formType;
  private String fileId;

  public DeleteFormService(
      FormDao formDao,
      MongoDatabase db,
      String username,
      String orgName,
      UserType userType,
      FormType formType,
      String fileId) {
    this.formDao = formDao;
    this.db = db;
    this.username = username;
    this.orgName = orgName;
    this.userType = userType;
    this.formType = formType;
    this.fileId = fileId;
  }

  @Override
  public Message executeAndGetResponse() {
    if (!ValidationUtils.isValidObjectId(fileId) || formType == null) {
      return FormMessage.INVALID_PARAMETER;
    }
    if (!ValidationUtils.isValidObjectId(fileId) || formType == null) {
      return FormMessage.INVALID_PARAMETER;
    }
    ObjectId fileID = new ObjectId(fileId);
    return delete(username, orgName, formType, userType, fileID, db);
  }

  public Message delete(
      String user,
      String organizationName,
      FormType formType,
      UserType privilegeLevel,
      ObjectId id,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, formType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return FormMessage.NO_SUCH_FILE;
    }
    if (formType == FormType.APPLICATION
        && (privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return FormMessage.SUCCESS;
      }
    } else if (formType == FormType.IDENTIFICATION
        && (privilegeLevel == UserType.Client || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        gridBucket.delete(id);
        return FormMessage.SUCCESS;
      }
    } else if (formType == FormType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return FormMessage.SUCCESS;
      }
    }
    return FormMessage.INSUFFICIENT_PRIVILEGE;
  }
}
