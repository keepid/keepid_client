package Config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;

import java.util.Objects;

public class MongoConfig {
  public static final String MONGO_DB_TEST = "test-db";
  public static final String MONGO_DB_STAGING = "staging-db";
  public static final String MONGO_DB_PRODUCTION = "production-db";
  public static final String MONGO_URI = Objects.requireNonNull(System.getenv("MONGO_URI"));
  private static MongoClient client;

  private static void startConnection() {
    ConnectionString connectionString = new ConnectionString(MONGO_URI);
    CodecRegistry pojoCodecRegistry =
        CodecRegistries.fromProviders(PojoCodecProvider.builder().automatic(true).build());
    CodecRegistry codecRegistry =
        CodecRegistries.fromRegistries(
            MongoClientSettings.getDefaultCodecRegistry(), pojoCodecRegistry);
    MongoClientSettings clientSettings =
        MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .codecRegistry(codecRegistry)
            .build();
    client = MongoClients.create(clientSettings);
  }

  public static MongoClient getMongoClient() {
    if (client == null) {
      startConnection();
    }
    return client;
  }

  public static MongoDatabase getDatabase(DeploymentLevel deploymentLevel) {
    if (client == null) {
      throw new IllegalStateException("Please start a client before getting a database");
    }
    switch (deploymentLevel) {
      case TEST:
        return client.getDatabase(MONGO_DB_TEST);
      case STAGING:
        return client.getDatabase(MONGO_DB_STAGING);
      case PRODUCTION:
        return client.getDatabase(MONGO_DB_PRODUCTION);
      default:
        return null;
    }
  }

  public static void closeClientConnection() {
    client.close();
  }

  public static void dropDatabase(DeploymentLevel deploymentLevel) {
    MongoDatabase db = getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("Please start a client before dropping a database");
    }
    db.drop();
    try {
      Thread.sleep(4000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}
