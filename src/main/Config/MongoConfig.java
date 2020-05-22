package Config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import java.util.Objects;

public class MongoConfig {

  private static MongoClient client;
  private static MongoClient testClient;

  public static String getDatabaseName() {
    if (System.getenv("MONGO_DB_NAME") == null) {
      throw new NullPointerException(
          "Please use https://github.com/Ashald/EnvFile to configure the .env file");
    } else {
      return System.getenv("MONGO_DB_NAME");
    }
  }

  public static void startConnection() {
    client = MongoClients.create(Objects.requireNonNull(System.getenv("MONGO_URI")));
  }

  public static void startTestConnection() {
    testClient = MongoClients.create(Objects.requireNonNull(System.getenv("MONGO_TEST_URI")));
  }

  public static MongoClient getMongoClient() {
    if (client == null) {
      startConnection();
    }
    return client;
  }

  public static MongoClient getMongoTestClient() {
    if (testClient == null) {
      startTestConnection();
    }
    return testClient;
  }

  public static void closeConnection() {
    client.close();
  }

  public static void cleanTestDatabase() {
    testClient.getDatabase(getDatabaseName()).drop();
  }

  public static void closeTestConnection() {
    testClient.close();
  }
}
