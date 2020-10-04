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
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;

public class GetAllPdfFilesService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String orgName;
  private UserType userType;
  private PDFType pdfType;
  private JSONArray files;

  public GetAllPdfFilesService(
      MongoDatabase db,
      Logger logger,
      String username,
      String orgName,
      UserType userType,
      PDFType pdfType) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.orgName = orgName;
    this.userType = userType;
    this.pdfType = pdfType;
  }

  @Override
  public Message executeAndGetResponse() {
    if (pdfType == null) {
      return PdfMessage.INVALID_PDF_TYPE;
    } else {
      return getAllFiles(username, orgName, userType, pdfType, db);
    }
  }

  public JSONArray getFiles() {
    Objects.requireNonNull(files);
    return files;
  }

  public Message getAllFiles(
      String uploader,
      String organizationName,
      UserType privilegeLevel,
      PDFType pdfType,
      MongoDatabase db) {
    try {
      Bson filter;
      if (pdfType == PDFType.APPLICATION
          && (privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Worker)) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        return PdfMessage.SUCCESS;
      } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
        filter = Filters.eq("metadata.uploader", uploader);
        files = mongodbGetAllFiles(filter, pdfType, db);
        return PdfMessage.SUCCESS;
      } else if (pdfType == PDFType.FORM) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        return PdfMessage.SUCCESS;
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
    } catch (Exception e) {
      return PdfMessage.INVALID_PARAMETER;
    }
  }

  private static JSONArray mongodbGetAllFiles(Bson filter, PDFType pdfType, MongoDatabase db) {
    JSONArray files = new JSONArray();
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    for (GridFSFile grid_out : gridBucket.find(filter)) {
      assert grid_out.getMetadata() != null;
      files.put(
          new JSONObject()
              .put("filename", grid_out.getFilename())
              .put("uploader", grid_out.getMetadata().getString("uploader"))
              .put("organizationName", grid_out.getMetadata().getString("organizationName"))
              .put("id", grid_out.getId().asObjectId().getValue().toString())
              .put("uploadDate", grid_out.getUploadDate().toString()));
    }
    return files;
  }
}
