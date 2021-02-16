package User.Services;

import Config.Message;
import Config.Service;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import lombok.extern.slf4j.Slf4j;
import org.bson.conversions.Bson;

import java.io.InputStream;

@Slf4j
public class LoadPfpService implements Service {
  MongoDatabase db;
  private String username;
  private InputStream res;
  private String contentType;

  public LoadPfpService(MongoDatabase db, String username) {
    this.db = db;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    log.info("Started get pfp service");
    Bson filter = Filters.eq("metadata.owner", username);
    GridFSBucket gridBucket = GridFSBuckets.create(db, "pfp");
    GridFSFile grid_out = gridBucket.find(filter).limit(1).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      log.info("No pfp found");
      return UserMessage.USER_NOT_FOUND;
    }
    String fileName = grid_out.getFilename();
    String[] temp = fileName.split("\\.");
    contentType = temp[temp.length - 1];
    if (!contentType.equals("png")) {
      contentType = "jpeg";
    }
    log.info("Loaded profile pic with name " + grid_out.getFilename());
    InputStream pfp = gridBucket.openDownloadStream(grid_out.getObjectId());
    res = pfp;
    return UserMessage.SUCCESS;
  }

  public InputStream getRes() {
    return res;
  }

  public String getContentType() {
    return contentType;
  }
}
