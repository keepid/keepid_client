package Database.PDF;

import Config.DeploymentLevel;
import Config.MongoConfig;
import PDF.PDF;
import com.google.api.client.util.DateTime;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.types.ObjectId;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

public class PdfDaoImpl implements PdfDao {
  private MongoCollection<PDF> pdfCollection;

  public PdfDaoImpl(DeploymentLevel deploymentLevel) {
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("DB cannot be null");
    }
    pdfCollection = db.getCollection("pdf", PDF.class);
  }

  @Override
  public List<PDF> getAll() {
    return null;
  }

  @Override
  public int size() {
    return 0;
  }

  @Override
  public void clear() {}

  @Override
  public void delete(PDF pdf) {}

  @Override
  public void update(PDF pdf) {}

  @Override
  public void save(PDF pdf) {}

  @Override
  public Optional<PDF> get(ObjectId id) {
    return Optional.empty();
  }

  @Override
  public Optional<PDF> getByFileId(ObjectId fileId) {
    return Optional.empty();
  }

  @Override
  public Optional<PDF> get(String username) {
    return Optional.empty();
  }

  @Override
  public Optional<InputStream> getStream(String username) {
    return Optional.empty();
  }

  @Override
  public Optional<InputStream> getStream(ObjectId id) {
    return Optional.empty();
  }

  @Override
  public void save(String uploaderUsername, InputStream fileInputStream) {}

  @Override
  public void save(String uploaderUsername, InputStream fileInputStream, DateTime uploadedAt) {}

  @Override
  public void delete(String username) {}

  @Override
  public void delete(ObjectId id) {}
}
