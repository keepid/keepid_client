package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;
import org.json.JSONObject;

public class PdfMongo {

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
