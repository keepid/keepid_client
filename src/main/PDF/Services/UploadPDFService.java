package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import PDF.PdfMessage;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import io.javalin.http.UploadedFile;
import org.bson.Document;
import org.slf4j.Logger;

import java.io.InputStream;
import java.time.LocalDate;

public class UploadPDFService implements Service {
  String uploader;
  String organizationName;
  UserType privilegeLevel;
  UploadedFile file;
  PDFType pdfType;
  MongoDatabase db;
  Logger logger;

  public UploadPDFService(
      MongoDatabase db,
      Logger logger,
      String uploaderUsername,
      String organizationName,
      UserType privilegeLevel,
      PDFType pdfType,
      UploadedFile file) {
    this.db = db;
    this.logger = logger;
    this.uploader = uploaderUsername;
    this.organizationName = organizationName;
    this.privilegeLevel = privilegeLevel;
    this.pdfType = pdfType;
    this.file = file;
  }

  @Override
  public Message executeAndGetResponse() {
    if (pdfType == null) {
      return PdfMessage.INVALID_PDF_TYPE;
    } else if (file == null) {
      return PdfMessage.INVALID_PDF;
    } else if (!file.getContentType().equals("application/pdf")
        && !file.getContentType().equals("application/octet-stream")) {
      return PdfMessage.INVALID_PDF;
    } else {
      if ((pdfType == PDFType.APPLICATION
              || pdfType == PDFType.IDENTIFICATION
              || pdfType == PDFType.FORM)
          && (privilegeLevel == UserType.Client
              || privilegeLevel == UserType.Worker
              || privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin)) {
        mongodbUpload(
            uploader, organizationName, file.getFilename(), file.getContent(), pdfType, db);
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
      return PdfMessage.SUCCESS;
    }
  }

  private static void mongodbUpload(
      String uploader,
      String organizationName,
      String filename,
      InputStream inputStream,
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(100000)
            .metadata(
                new Document("type", "pdf")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("uploader", uploader)
                    .append("organizationName", organizationName));
    gridBucket.uploadFromStream(filename, inputStream, options);
  }
}
