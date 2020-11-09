package User.Services;

import Config.Message;
import Config.Service;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.conversions.Bson;
import org.slf4j.Logger;

import java.io.InputStream;

public class LoadPfpService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private InputStream res;

  public LoadPfpService(MongoDatabase db, Logger logger, String username) {
    this.db = db;
    this.logger = logger;
    this.username = username;
  }

  @Override
  public Message executeAndGetResponse() {
    logger.info("Started get pfp service");
    Bson filter = Filters.eq("metadata.owner", username);
    GridFSBucket gridBucket = GridFSBuckets.create(db, "pfp");
    GridFSFile grid_out = gridBucket.find(filter).limit(1).first();
    if (grid_out == null || grid_out.getMetadata() == null) {
      return null;
    }
    logger.info("Loaded profile pic with name " + grid_out.getFilename());
    InputStream pfp = gridBucket.openDownloadStream(grid_out.getObjectId());
    res = pfp;
    return UserMessage.SUCCESS;
  }

  public InputStream getRes() {
    return res;
  }
}
