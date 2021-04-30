package Database.UserV2;

import Config.DeploymentLevel;
import Config.MongoConfig;
import User.V2.BaseUser;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.set;

public class UserV2DaoImpl implements UserV2Dao {
  private final MongoCollection<BaseUser> userCollection;

  public UserV2DaoImpl(DeploymentLevel deploymentLevel) {
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("DB cannot be null");
    }
    userCollection = db.getCollection("UserV2", BaseUser.class);
  }

  @Override
  public Optional<BaseUser> get(String username) {
    return Optional.ofNullable(userCollection.find(eq("username", username)).first());
  }

  @Override
  public Optional<BaseUser> get(ObjectId id) {
    return Optional.ofNullable(userCollection.find(eq("_id", id)).first());
  }

  @Override
  public List<BaseUser> getAll() {
    return userCollection.find().into(new ArrayList<>());
  }

  @Override
  public int size() {
    return (int) userCollection.countDocuments();
  }

  @Override
  public void delete(BaseUser user) {
    userCollection.deleteOne(eq("username", user.getFirstName()));
  }

  @Override
  public void clear() {
    userCollection.drop();
  }

  @Override
  public void save(BaseUser user) {
    userCollection.insertOne(user);
  }

  @Override
  public void update(BaseUser user) {
    Map<String, Object> keyValueMap = user.toMap();
    Bson statement =
        combine(
            user.toMap().keySet().stream()
                .filter(k -> keyValueMap.get(k) != null)
                .map(k -> set(k, user.toMap().get(k)))
                .collect(Collectors.toList()));
    userCollection.updateOne(eq("username", user.getUsername()), statement);
  }

  @Override
  public void update(Map<String, Object> map, String username) {
    Bson statement =
        combine(
            map.keySet().stream()
                .filter(k -> map.get(k) != null)
                .map(k -> set(k, map.get(k)))
                .collect(Collectors.toList()));
    userCollection.updateOne(eq("username", username), statement);
  }
}
