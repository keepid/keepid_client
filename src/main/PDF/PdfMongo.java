package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.time.LocalDate;

public class PdfMongo {

  public static JSONObject upload(
      String uploader,
      String organizationName,
      UserType privilegeLevel,
      String filename,
      ObjectId fileID,
      PDFType pdfType,
      InputStream inputStream,
      MongoDatabase db) {
    if ((pdfType == PDFType.APPLICATION
            || pdfType == PDFType.IDENTIFICATION
            || pdfType == PDFType.FORM)
        && (privilegeLevel == UserType.Client
            || privilegeLevel == UserType.Worker
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin)) {
      if ((pdfType == PDFType.FORM) && (fileID != null)) {
        return mongodbUploadAnnotatedForm(
            uploader, organizationName, filename, fileID, inputStream, pdfType, db);
      } else {
        mongodbUpload(uploader, organizationName, filename, inputStream, pdfType, db);
      }
    } else {
      return PdfMessage.INSUFFICIENT_PRIVILEGE.toJSON();
    }
    return PdfMessage.SUCCESS.toJSON();
  }

  private static void mongodbUpload(
      String uploader,
      String organizationName,
      String filename,
      InputStream inputStream,
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());

    if (pdfType == PDFType.FORM) {
      GridFSUploadOptions options =
          new GridFSUploadOptions()
              .chunkSizeBytes(100000)
              .metadata(
                  new Document("type", "pdf")
                      .append("upload_date", String.valueOf(LocalDate.now()))
                      .append("annotated", false)
                      .append("uploader", uploader)
                      .append("organizationName", organizationName));
      gridBucket.uploadFromStream(filename, inputStream, options);
      return;
    } else {
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

  private static JSONObject mongodbUploadAnnotatedForm(
      String uploader,
      String organizationName,
      String filename,
      ObjectId fileID,
      InputStream inputStream,
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", fileID)).first();

    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE.toJSON();
    }
    if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
      gridBucket.delete(fileID);
    }

    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(100000)
            .metadata(
                new Document("type", "pdf")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("annotated", true)
                    .append("uploader", uploader)
                    .append("organizationName", organizationName));
    gridBucket.uploadFromStream(filename, inputStream, options);
    return PdfMessage.SUCCESS.toJSON();
  }

  public static JSONObject getAllFiles(
      String uploader,
      String organizationName,
      UserType privilegeLevel,
      PDFType pdfType,
      boolean annotated,
      MongoDatabase db) {
    JSONObject res;
    try {
      Bson filter;
      JSONArray files;
      if (pdfType == PDFType.APPLICATION
          && (privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Worker)) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res = PdfMessage.SUCCESS.toJSON();
        res.put("documents", files);
      } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
        filter = Filters.eq("metadata.uploader", uploader);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res = PdfMessage.SUCCESS.toJSON();
        res.put("documents", files);
      } else if (pdfType == PDFType.FORM) {
        filter =
            Filters.and(
                Filters.eq("metadata.organizationName", organizationName),
                Filters.eq("metadata.annotated", annotated));
        files = mongodbGetAllFiles(filter, pdfType, db);
        res = PdfMessage.SUCCESS.toJSON();
        res.put("documents", files);
      } else {
        res = PdfMessage.INSUFFICIENT_PRIVILEGE.toJSON();
      }
    } catch (Exception e) {
      System.out.println(e.toString());
      res = PdfMessage.INVALID_PARAMETER.toJSON();
    }
    return res;
  }

  private static JSONArray mongodbGetAllFiles(Bson filter, PDFType pdfType, MongoDatabase db) {
    JSONArray files = new JSONArray();
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    if (pdfType.equals(PDFType.FORM)) {
      for (GridFSFile grid_out : gridBucket.find(filter)) {
        assert grid_out.getMetadata() != null;
        files.put(
            new JSONObject()
                .put("filename", grid_out.getFilename())
                .put("annotated", grid_out.getMetadata().getBoolean("annotated"))
                .put("uploader", grid_out.getMetadata().getString("uploader"))
                .put("organizationName", grid_out.getMetadata().getString("organizationName"))
                .put("id", grid_out.getId().asObjectId().getValue().toString())
                .put("uploadDate", grid_out.getUploadDate().toString()));
      }
    } else {
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
    }
    return files;
  }

  // Add option user
  public static InputStream download(
      String user,
      String organizationName,
      UserType privilegeLevel,
      ObjectId id,
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return null;
    }
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        return gridBucket.openDownloadStream(id);
      }
    }

    return null;
  }

  // Work on this method for privilege Checking!
  public static JSONObject delete(
      String user,
      String organizationName,
      PDFType pdfType,
      UserType privilegeLevel,
      ObjectId id,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE.toJSON();
    }
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    }
    return PdfMessage.INSUFFICIENT_PRIVILEGE.toJSON();
  }
}
