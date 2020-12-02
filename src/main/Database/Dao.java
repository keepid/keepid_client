package Database;

import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;

public interface Dao<T> {

  Optional<T> get(ObjectId id);

  List<T> getAll();

  int size();

  void save(T t);

  void update(T t, String[] params);

  void delete(T t);

  void clear();
}
