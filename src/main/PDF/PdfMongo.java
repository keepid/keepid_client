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
      PdfType pdfType,
      InputStream inputStream,
      MongoDatabase db) {
    if ((pdfType == PdfType.APPLICATION
            || pdfType == PdfType.IDENTIFICATION
            || pdfType == PdfType.FORM)
        && (privilegeLevel == UserType.Client
            || privilegeLevel == UserType.Worker
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin)) {
      mongodbUpload(uploader, organizationName, filename, inputStream, pdfType, db);
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
      PdfType pdfType,
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

  public static JSONObject getAllFiles(
      String uploader,
      String organizationName,
      UserType privilegeLevel,
      PdfType pdfType,
      MongoDatabase db) {
    JSONObject res;
    try {
      Bson filter;
      JSONArray files;
      if (pdfType == PdfType.APPLICATION
          && (privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Worker)) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res = PdfMessage.SUCCESS.toJSON();
        res.put("documents", files);
      } else if (pdfType == PdfType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
        filter = Filters.eq("metadata.uploader", uploader);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res = PdfMessage.SUCCESS.toJSON();
        res.put("documents", files);
      } else if (pdfType == PdfType.FORM) {
        filter = Filters.eq("metadata.organizationName", organizationName);
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

  private static JSONArray mongodbGetAllFiles(Bson filter, PdfType pdfType, MongoDatabase db) {
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

  // Add option user
  public static InputStream download(
      String user,
      String organizationName,
      UserType privilegeLevel,
      ObjectId id,
      PdfType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return null;
    }
    if (pdfType == PdfType.APPLICATION
        && (privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PdfType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PdfType.FORM) {
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
      PdfType pdfType,
      UserType privilegeLevel,
      ObjectId id,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return PdfMessage.NO_SUCH_FILE.toJSON();
    }
    if (pdfType == PdfType.APPLICATION
        && (privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    } else if (pdfType == PdfType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    } else if (pdfType == PdfType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        gridBucket.delete(id);
        return PdfMessage.SUCCESS.toJSON();
      }
    }
    return PdfMessage.INSUFFICIENT_PRIVILEGE.toJSON();
  }
}
