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
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;

import java.io.InputStream;
import java.time.LocalDate;

import static com.mongodb.client.model.Filters.eq;

public class UploadAnnotatedPDFService implements Service {
  public static final int CHUNK_SIZE_BYTES = 100000;

  String uploader;
  String organizationName;
  UserType privilegeLevel;
  String fileIDStr;
  String filename;
  String fileContentType;
  InputStream fileStream;
  MongoDatabase db;
  Logger logger;

  public UploadAnnotatedPDFService(
      MongoDatabase db,
      Logger logger,
      String uploaderUsername,
      String organizationName,
      UserType privilegeLevel,
      String fileIDStr,
      String filename,
      String fileContentType,
      InputStream fileStream) {
    this.db = db;
    this.logger = logger;
    this.uploader = uploaderUsername;
    this.organizationName = organizationName;
    this.privilegeLevel = privilegeLevel;
    this.fileIDStr = fileIDStr;
    this.filename = filename;
    this.fileContentType = fileContentType;
    this.fileStream = fileStream;
  }

  @Override
  public Message executeAndGetResponse() {
    if (fileStream == null) {
      return PdfMessage.INVALID_PDF;
    } else if (!fileContentType.equals("application/pdf")
        && !fileContentType.equals("application/octet-stream")) {
      return PdfMessage.INVALID_PDF;
    } else {
      if ((privilegeLevel == UserType.Client
          || privilegeLevel == UserType.Worker
          || privilegeLevel == UserType.Director
          || privilegeLevel == UserType.Admin
          || privilegeLevel == UserType.Developer)) {
        return mongodbUploadAnnotatedForm(
            uploader, organizationName, filename, fileIDStr, fileStream, db);
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
    }
  }

  public static PdfMessage mongodbUploadAnnotatedForm(
      String uploader,
      String organizationName,
      String filename,
      String fileIDStr,
      InputStream inputStream,
      MongoDatabase db) {
    ObjectId fileID = new ObjectId(fileIDStr);
    GridFSBucket gridBucket = GridFSBuckets.create(db, PDFType.FORM.toString());
    GridFSFile grid_out = gridBucket.find(eq("_id", fileID)).first();

    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE;
    }
    if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
      gridBucket.delete(fileID);
    }

    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(CHUNK_SIZE_BYTES)
            .metadata(
                new Document("type", "pdf")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("annotated", true)
                    .append("uploader", uploader)
                    .append("organizationName", organizationName));
    gridBucket.uploadFromStream(filename, inputStream, options);
    return PdfMessage.SUCCESS;
  }
}
