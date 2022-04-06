package Database.Form;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Form.Form;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

public class FormDaoImpl implements FormDao {
  private MongoCollection<Form> formCollection;

  public FormDaoImpl(DeploymentLevel deploymentLevel) {
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("DB cannot be null");
    }
    formCollection = db.getCollection("form", Form.class);
  }

  @Override
  public List<Form> getAll() {
    return formCollection.find().into(new ArrayList<>());
  }

  @Override
  public int size() {
    return (int) formCollection.countDocuments();
  }

  @Override
  public void clear() {
    formCollection.drop();
  }

  @Override
  public void delete(Form form) {
    formCollection.deleteOne(eq("fileId", form.getFileId()));
  }

  @Override
  public void update(Form form) {
    formCollection.replaceOne(eq("fileId", form.getFileId()), form);
  }

  @Override
  public void save(Form form) {
    formCollection.insertOne(form);
  }

  @Override
  public Optional<Form> get(ObjectId id) {
    return Optional.ofNullable(formCollection.find(eq("_id", id)).first());
  }

  @Override
  public Optional<Form> getByFileId(ObjectId fileId) {
    return Optional.ofNullable(formCollection.find(eq("fileId", fileId)).first());
  }

  @Override
  public Optional<Form> get(String username) {
    return Optional.ofNullable(formCollection.find(eq("username", username)).first());
  }

  @Override
  public void delete(ObjectId id) {
    formCollection.deleteOne(eq("_id", id));
  }
}
