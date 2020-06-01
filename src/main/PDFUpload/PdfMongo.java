package PDFUpload;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.time.LocalDate;

public class PdfMongo {

  public static ObjectId upload(
      String uploader,
      String filename,
      PDFType pdfType,
      InputStream inputStream,
      MongoDatabase db) {
    System.out.println("Calling upload...");
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    System.out.println(uploader);
    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(100000)
            .metadata(
                new Document("type", "pdf")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("uploader", uploader));
    System.out.println("about to upload");
    ObjectId id = gridBucket.uploadFromStream(filename, inputStream, options);
    System.out.println("uploaded");
    return id;
  } // Add option user

  public static JSONObject getAllFiles(String uploader, PDFType pdfType, MongoDatabase db) {
    JSONArray files = new JSONArray();
    JSONObject filesj = new JSONObject();
    System.out.println("uploader");

    try {
      GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
      // Figure out filters
      System.out.println("got here " + uploader);

      // Make all when it does form
      for (GridFSFile grid_out : gridBucket.find(Filters.eq("metadata.uploader", uploader))) {
        System.out.println("add");
        files.put(
            new JSONObject()
                .put("filename", grid_out.getFilename())
                .put("uploader", grid_out.getMetadata().getString("uploader"))
                .put("id", grid_out.getId().toString())
                .put("uploadDate", grid_out.getUploadDate().toString()));
      }
      filesj.put("documents", files);
      return filesj;
    } catch (Exception e) {
      return filesj;
    }
  }

  // Add option user
  public static InputStream download(String user, ObjectId id, PDFType pdfType, MongoDatabase db) {
    System.out.println("Calling download...");
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return null;
    }
    if (grid_out.getMetadata().getString("uploader").equals(user)) {
      return gridBucket.openDownloadStream(id);
    }
    return null;
  }

  public static boolean delete(String user, ObjectId id, MongoDatabase db) {
    GridFSBucket gridBucket = GridFSBuckets.create(db);
    GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return false;
    }
    if (grid_out.getMetadata().getString("uploader").equals(user)) {
      gridBucket.delete(id);
      return true;
    } else {
      return false;
    }
  }
}
