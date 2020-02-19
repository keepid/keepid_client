package UserIntTests;

import Config.MongoConfig;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.bson.Document;
import org.json.JSONObject;

import static com.mongodb.client.model.Filters.eq;

public class ResetPassword {
    public Handler resetPassword =
            ctx -> {
                JSONObject req = new JSONObject(ctx.body());
                String username = req.getString("username");
                String password = req.getString("password");
                String npassword = req.getString("nPassword");
                String npassword2 = req.getString("nPassword2");
                if (!npassword.equals(npassword2)) {
                    ctx.result(UserMessage.PASSWORDS_DO_NOT_MATCH.getErrorName());
                    return;
                }
                Argon2 argon2 = Argon2Factory.create();
                char[] passwordArr = password.toCharArray();
                try {
                    // retrieve hash from database
                    // do mongodb lookup here
                    MongoClient client = MongoConfig.getMongoClient();
                    MongoDatabase database = client.getDatabase(MongoConfig.getDatabaseName());
                    MongoCollection<Document> userCollection = database.getCollection("user");
                    Document user = userCollection.find(eq("username", username)).first();
                    if (user == null) {
                        ctx.json(UserMessage.USER_NOT_FOUND.getErrorName());
                        argon2.wipeArray(passwordArr);
                        return;
                    }

                    String hash = user.get("password", String.class);
                    if (argon2.verify(hash, passwordArr)) {
                        char[] passwordArr2 = npassword.toCharArray();
                        String passwordHash;
                        try {
                            passwordHash = argon2.hash(10, 65536, 1, passwordArr2);
                            argon2.wipeArray(passwordArr);
                            user.replace("password", passwordHash);
                        } catch (Exception e) {
                            argon2.wipeArray(passwordArr);
                            ctx.result(UserMessage.HASH_FAILURE.getErrorName());
                            return;
                        }

                        ctx.json(UserMessage.AUTH_SUCCESS.getErrorName());
                    } else {
                        // Hash doesn't match password
                        ctx.json(UserMessage.AUTH_FAILURE.getErrorName());
                    }
                } catch (Exception e) {
                    ctx.json(UserMessage.HASH_FAILURE.getErrorName());
                } finally {
                    // Wipe confidential data from cache
                    argon2.wipeArray(passwordArr);
                }
            };
}
