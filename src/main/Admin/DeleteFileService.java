package Admin;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;

import java.util.ArrayList;
import java.util.List;

public class DeleteFileService implements Service {
  MongoDatabase db;
  String orgName;

  public DeleteFileService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {

    // TODO(xander) make more efficient?

    // Form
    GridFSBucket gridBucket = GridFSBuckets.create(db, PDFType.FORM.toString());
    List<GridFSFile> files =
        gridBucket.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    for (GridFSFile file : files) {
      gridBucket.delete(file.getObjectId());
    }

    // Application
    GridFSBucket gridBucket2 = GridFSBuckets.create(db, PDFType.APPLICATION.toString());
    List<GridFSFile> files2 =
        gridBucket2.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    for (GridFSFile file2 : files2) {
      gridBucket2.delete(file2.getObjectId());
    }

    // Identification
    GridFSBucket gridBucket3 = GridFSBuckets.create(db, PDFType.IDENTIFICATION.toString());
    List<GridFSFile> files3 =
        gridBucket3.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    for (GridFSFile file3 : files3) {
      gridBucket3.delete(file3.getObjectId());
    }

    return AdminMessages.SUCCESS;
  }
}
