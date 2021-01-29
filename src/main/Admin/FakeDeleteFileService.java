package Admin;

import Config.Message;
import Config.Service;
import PDF.PDFType;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class FakeDeleteFileService implements Service {
  MongoDatabase db;
  String orgName;

  JSONObject res = null;

  public FakeDeleteFileService(MongoDatabase db, String orgName) {
    this.db = db;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {

    // Form
    GridFSBucket gridBucket = GridFSBuckets.create(db, PDFType.FORM.toString());
    List<GridFSFile> files =
        gridBucket.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    this.res = new JSONObject();

    res.put("form", files);

    // Application
    GridFSBucket gridBucket2 = GridFSBuckets.create(db, PDFType.APPLICATION.toString());
    List<GridFSFile> files2 =
        gridBucket2.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    res.put("application", files2);

    // Identification
    GridFSBucket gridBucket3 = GridFSBuckets.create(db, PDFType.IDENTIFICATION.toString());
    List<GridFSFile> files3 =
        gridBucket3.find(Filters.eq("metadata.organizationName", orgName)).into(new ArrayList<>());

    res.put("identification", files3);

    return AdminMessages.SUCCESS;
  }
}
