package PDFUpload;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import java.io.*;
import java.time.LocalDate;

import org.json.JSONArray;
import org.json.JSONObject;

public class PdfMongo {

  public static ObjectId upload(String uploader, String title, InputStream inputStream, MongoDatabase db) {
      System.out.println("Calling upload...");
      GridFSBucket gridBucket = GridFSBuckets.create(db);
      GridFSUploadOptions options =
              new GridFSUploadOptions()
                      .chunkSizeBytes(1024)
                      .metadata(
                              new Document("type", "pdf")
                                      .append("upload_date", String.valueOf(LocalDate.now()))
                                      .append("uploader", uploader));
      return gridBucket.uploadFromStream(title, inputStream, options);
  }  //Add option user
    public static JSONArray getAllFiles(String uploader, MongoDatabase db){
        JSONArray files = new JSONArray();
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);
            //Figure out filters
            for (GridFSFile grid_out : gridBucket.find(Filters.eq("metadata.uploader", uploader))){
                files.put(new JSONObject().put("filename", grid_out.getFilename())
                        .put("uploader", grid_out.getMetadata().getString("uploader"))
                        .put("id", grid_out.getId())
                        .put("uploadDate", grid_out.getUploadDate().toString()));
            }
            return files;
        } catch (Exception e) {
            return files;
        }
    }

    //Add option user
    public static InputStream download(String user, ObjectId id, MongoDatabase db){
        System.out.println("Calling download...");
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);
            GridFSFile grid_out = gridBucket.find(Filters.eq("_id", id)).first();
            if (grid_out.getMetadata().getString("uploader").equals(user)) {
                return gridBucket.openDownloadStream(id);
            }
        } catch (Exception e) {
          e.printStackTrace();
        }
        return null;
  }
}
