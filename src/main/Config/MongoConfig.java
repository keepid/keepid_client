package Config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import java.util.Objects;

public class MongoConfig {

  private static MongoClient client;
  private static MongoClient testClient;
  // ALSO if you are having a Null Pointer Exception in the Mongo Config, please follow the
  // instructions here: https://github.com/Ashald/EnvFile. We are deprecating the use of dotenv
  // because it is interfering
  // with our heroku deployment (also the heroku deployment doesn't see the env file anyway).
  // Therefore, please edit the run configurations in IntelliJ at this link here:
  // https://github.com/Ashald/EnvFile.
  public static String getDatabaseName() {
    return System.getenv("MONGO_DB_NAME");
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
