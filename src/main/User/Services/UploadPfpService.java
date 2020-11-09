package User.Services;

import Config.Message;
import Config.Service;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import io.javalin.http.UploadedFile;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.slf4j.Logger;

import java.io.InputStream;
import java.time.LocalDate;

public class UploadPfpService implements Service {
  MongoDatabase db;
  Logger logger;
  private String username;
  private UploadedFile pfp;

  public UploadPfpService(MongoDatabase db, Logger logger, String username, UploadedFile pfp) {
    this.db = db;
    this.logger = logger;
    this.username = username;
    this.pfp = pfp;
  }

  @Override
  public Message executeAndGetResponse() {
    String fileName = pfp.getFilename();
    InputStream content = pfp.getContent();
    Bson filter = Filters.eq("metadata.owner", username);
    GridFSBucket gridBucket = GridFSBuckets.create(db, "pfp");
    GridFSFile grid_out = gridBucket.find(filter).first();
    if (grid_out != null) {
      gridBucket.delete(grid_out.getObjectId());
    }
    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(100000)
            .metadata(
                new Document("type", "pfp")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("owner", username));
    gridBucket.uploadFromStream(fileName, content, options);
    return UserMessage.SUCCESS.withMessage("Profile Picture Uploaded Successfully");
  }
}
