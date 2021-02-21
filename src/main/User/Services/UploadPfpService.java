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
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.io.InputStream;
import java.time.LocalDate;

@Slf4j
public class UploadPfpService implements Service {
  MongoDatabase db;
  private String username;
  private String fileName;
  private UploadedFile pfp;

  public UploadPfpService(MongoDatabase db, String username, UploadedFile pfp, String fileName) {
    this.db = db;
    this.username = username;
    this.pfp = pfp;
    this.fileName = fileName;
  }

  @Override
  public Message executeAndGetResponse() {
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
    log.info(username + " has successfully uploaded a profile picture with name  " + fileName);
    return UserMessage.SUCCESS.withMessage("Profile Picture uploaded Successfully");
  }
}
