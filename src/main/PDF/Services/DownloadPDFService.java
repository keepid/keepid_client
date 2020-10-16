package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import PDF.PdfMessage;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;
import org.slf4j.Logger;

import java.io.InputStream;
import java.util.Objects;

public class DownloadPDFService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String orgName;
  private UserType privilegeLevel;
  private PDFType pdfType;
  private String fileId;
  private InputStream inputStream;

  public DownloadPDFService(
      MongoDatabase db,
      Logger logger,
      String username,
      String orgName,
      UserType privilegeLevel,
      String fileId,
      PDFType pdfType) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.orgName = orgName;
    this.privilegeLevel = privilegeLevel;
    this.pdfType = pdfType;
    this.fileId = fileId;
  }

  @Override
  public Message executeAndGetResponse() {
    ObjectId fileID = new ObjectId(fileId);
    if (pdfType == null) {
      return PdfMessage.INVALID_PDF;
    }
    if (privilegeLevel == UserType.Client
        || privilegeLevel == UserType.Worker
        || privilegeLevel == UserType.Director
        || privilegeLevel == UserType.Admin) {
      return download(username, orgName, privilegeLevel, fileID, pdfType, db);
    } else {
      return PdfMessage.INSUFFICIENT_PRIVILEGE;
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
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE;
    }
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        this.inputStream = gridBucket.openDownloadStream(id);
        return PdfMessage.SUCCESS;
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        this.inputStream = gridBucket.openDownloadStream(id);
        return PdfMessage.SUCCESS;
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        this.inputStream = gridBucket.openDownloadStream(id);
        return PdfMessage.SUCCESS;
      }
    }
    return PdfMessage.INVALID_PDF_TYPE;
  }
}
