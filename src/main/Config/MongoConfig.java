package Config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import io.github.cdimascio.dotenv.Dotenv;

public class MongoConfig {

    private static MongoClient client;

    public static String getDatabaseName() {
        return Env.getInstance().get("MONGO_DB_NAME");
    }

    // Call once upon starting the server.
    public static void startConnection() {
        client = new MongoClient(new MongoClientURI(Dotenv.load().get("MONGO_URI")));
    }

    public static MongoClient getMongoClient() {
        // In case startConnection() was not called.
        if (client == null) {
            startConnection();
        }
        return client;
    }
}
