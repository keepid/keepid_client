package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import PDF.PdfMessage;
import Security.EncryptionUtils;
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

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Objects;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class GetAllFilesPDFService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private String orgName;
  private UserType userType;
  private PDFType pdfType;
  private JSONArray files;
  private boolean annotated;

  public GetAllFilesPDFService(
      MongoDatabase db,
      Logger logger,
      String username,
      String orgName,
      UserType userType,
      PDFType pdfType,
      boolean annotated) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.orgName = orgName;
    this.userType = userType;
    this.pdfType = pdfType;
    this.annotated = annotated;
  }

  @Override
  public Message executeAndGetResponse() {
    if (pdfType == null) {
      return PdfMessage.INVALID_PDF_TYPE;
    } else {
      return getAllFiles(username, orgName, userType, pdfType, annotated, db);
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
      boolean annotated,
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
        filter =
            and(
                eq("metadata.organizationName", organizationName),
                eq("metadata.annotated", annotated));
        files = mongodbGetAllFiles(filter, pdfType, db);
        return PdfMessage.SUCCESS;
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
    } catch (Exception e) {
      return PdfMessage.INVALID_PARAMETER;
    }
  }

  public static JSONArray mongodbGetAllFiles(Bson filter, PDFType pdfType, MongoDatabase db)
      throws GeneralSecurityException, IOException {
    JSONArray files = new JSONArray();
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    for (GridFSFile grid_out : gridBucket.find(filter)) {
      assert grid_out.getMetadata() != null;
      String uploaderUsername = grid_out.getMetadata().getString("uploader");
      JSONObject fileMetadata =
          new JSONObject()
              .put("uploader", uploaderUsername)
              .put("organizationName", grid_out.getMetadata().getString("organizationName"))
              .put("id", grid_out.getId().asObjectId().getValue().toString())
              .put("uploadDate", grid_out.getUploadDate().toString());
      if (pdfType.equals(PDFType.FORM)) {
        fileMetadata.put("filename", grid_out.getFilename());
        fileMetadata.put("annotated", grid_out.getMetadata().getBoolean("annotated"));
      } else if (pdfType.equals(PDFType.APPLICATION) || pdfType.equals(PDFType.IDENTIFICATION)) {
        fileMetadata.put(
            "filename",
            EncryptionUtils.getInstance().decryptString(grid_out.getFilename(), uploaderUsername));
      }
      files.put(fileMetadata);
    }
    return files;
  }
}
