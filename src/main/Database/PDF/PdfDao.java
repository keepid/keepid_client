package Database.PDF;

import Database.Dao;
import PDF.PDF;
import com.google.api.client.util.DateTime;
import org.bson.types.ObjectId;

import java.io.InputStream;
import java.util.Optional;

public interface PdfDao extends Dao<PDF> {
  Optional<PDF> get(ObjectId id);

  Optional<PDF> getByFileId(ObjectId fileId);

  Optional<PDF> get(String username);

  Optional<InputStream> getStream(String username);

  Optional<InputStream> getStream(ObjectId id);

  void save(String uploaderUsername, InputStream fileInputStream);

  void save(String uploaderUsername, InputStream fileInputStream, DateTime uploadedAt);

  void delete(String username);

  void delete(ObjectId id);
}
