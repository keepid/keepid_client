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
      PDFType pdfType,
      InputStream inputStream,
      MongoDatabase db) {

    JSONObject res = new JSONObject();
    ObjectId id;
    System.out.println(privilegeLevel);

    // Privilege Checking
    if (pdfType == PDFType.APPLICATION && (privilegeLevel == UserType.Client)) {
      id = mongodbUpload(uploader, organizationName, filename, inputStream, pdfType, db);
      res.put("id", id);
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      id = mongodbUpload(uploader, organizationName, filename, inputStream, pdfType, db);
      res.put("id", id);
    } else if (pdfType == PDFType.FORM
        && (privilegeLevel == UserType.Admin || privilegeLevel == UserType.Director)) {
      id = mongodbUpload(uploader, organizationName, filename, inputStream, pdfType, db);
      res.put("id", id);
    } else {
      id = null;
    }
    if (id == null) {
      res.put("status", "insufficient privilege");
    } else {
      res.put("status", "success");
    }
    return res;
  } // Add option user

  // Do not call method outside upload!
  private static ObjectId mongodbUpload(
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
    ObjectId id = gridBucket.uploadFromStream(filename, inputStream, options);
    return id;
  }

  // Secure Here!
  public static JSONObject getAllFiles(
      String uploader,
      String organizationName,
      UserType privilegeLevel,
      PDFType pdfType,
      MongoDatabase db) {
    JSONObject res = new JSONObject();
    try {
      Bson filter;
      JSONArray files;

      // Privilege Checking
      if (pdfType == PDFType.APPLICATION
          && (privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Worker)) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res.put("status", "success");
        res.put("documents", files);
      } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
        filter = Filters.eq("metadata.uploader", uploader);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res.put("status", "success");
        res.put("documents", files);
      } else if (pdfType == PDFType.FORM) {
        filter = Filters.eq("metadata.organizationName", organizationName);
        files = mongodbGetAllFiles(filter, pdfType, db);
        res.put("status", "success");
        res.put("documents", files);
      } else {
        res.put("status", "invalid privilege");
      }
    } catch (Exception e) {
      System.out.println(e.toString());
      res.put("status", "error: " + e.toString());
    }
    return res;
  }

  private static JSONArray mongodbGetAllFiles(Bson filter, PDFType pdfType, MongoDatabase db) {
    JSONArray files = new JSONArray();
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    for (GridFSFile grid_out : gridBucket.find(filter)) {
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
      PDFType pdfType,
      MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return null;
    }

    // Privilege Checking
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        String filename = grid_out.getFilename();
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        String filename = grid_out.getFilename();
        return gridBucket.openDownloadStream(id);
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        String filename = grid_out.getFilename();
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
    GridFSBucket gridBucket = GridFSBuckets.create(db);
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    JSONObject res = new JSONObject();

    if (grid_out == null || grid_out.getMetadata() == null) {
      res.put("status", "no such file");
      return res;
    }

    // Privilege Checking
    if (pdfType == PDFType.APPLICATION
        && (privilegeLevel == UserType.Admin || privilegeLevel == UserType.Worker)) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        String filename = grid_out.getFilename();
        gridBucket.delete(id);
        res.put("status", "success");
        return res;
      }
    } else if (pdfType == PDFType.IDENTIFICATION && (privilegeLevel == UserType.Client)) {
      if (grid_out.getMetadata().getString("uploader").equals(user)) {
        String filename = grid_out.getFilename();
        gridBucket.delete(id);
        res.put("status", "success");
        return res;
      }
    } else if (pdfType == PDFType.FORM) {
      if (grid_out.getMetadata().getString("organizationName").equals(organizationName)) {
        String filename = grid_out.getFilename();
        gridBucket.delete(id);
        res.put("status", "success");
        return res;
      }
    }
    res.put("status", "insufficient privilege");
    return res;
  }
}
