package Config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import io.github.cdimascio.dotenv.Dotenv;

public class MongoConfig {

    private static MongoClient client;
    private static MongoClient testClient;

    public static String getDatabaseName() {
        return Env.getInstance().get("MONGO_DB_NAME");
    }

    public static void startConnection() {
        client = new MongoClient(new MongoClientURI(Dotenv.load().get("MONGO_URI")));
    }

    public static void startTestConnection() {
        testClient = new MongoClient(new MongoClientURI(Dotenv.load().get("MONGO_TEST_URI")));
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
