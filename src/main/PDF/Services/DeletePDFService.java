package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import PDF.PdfMessage;
import User.UserType;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;
import org.slf4j.Logger;

public class DeletePDFService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String orgName;
  private UserType userType;
  private PDFType pdfType;
  private String fileId;

  public DeletePDFService(
      MongoDatabase db,
      Logger logger,
      String username,
      String orgName,
      UserType userType,
      PDFType pdfType,
      String fileId) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.orgName = orgName;
    this.userType = userType;
    this.pdfType = pdfType;
    this.fileId = fileId;
  }

  @Override
  public Message executeAndGetResponse() {
    if (!ValidationUtils.isValidObjectId(fileId) || pdfType == null) {
      return PdfMessage.INVALID_PARAMETER;
    }
    if (!ValidationUtils.isValidObjectId(fileId) || pdfType == null) {
      return PdfMessage.INVALID_PARAMETER;
    }
    ObjectId fileID = new ObjectId(fileId);
    return delete(username, orgName, pdfType, userType, fileID, db);
  }

  public Message delete(
      String user,
      String organizationName,
      PDFType pdfType,
      UserType privilegeLevel,
      ObjectId id,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE;
    }
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS;
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS;
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS;
      }
    }
    return PdfMessage.INSUFFICIENT_PRIVILEGE;
  }
}
