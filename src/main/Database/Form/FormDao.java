package Database.Form;

import Database.Dao;
import Form.Form;
import org.bson.types.ObjectId;

import java.util.Optional;

public interface FormDao extends Dao<Form> {
  Optional<Form> get(ObjectId id);

  Optional<Form> getByFileId(ObjectId fileId);

  Optional<Form> get(String username);

  void save(Form form);

  void delete(ObjectId id);
}
