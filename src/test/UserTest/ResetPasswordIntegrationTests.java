package UserTest;

import Config.MongoConfig;
import Security.AccountSecurityController;
import Security.SecurityUtils;
import Security.Tokens;
import User.User;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Context;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Test;

import java.security.SecureRandom;

import static com.mongodb.client.model.Filters.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ResetPasswordIntegrationTests {
    Context ctx = mock(Context.class);
    MongoClient testClient = MongoConfig.getMongoClient();
    MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

    // Make sure to enable .env file configurations for these tests

    @Test
    public void resetPasswordWithJWTTest() throws Exception {
        String username = "password-reset-test";
        String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
        int expirationTime = 7200000; // 2 hours
        String jwt =
                SecurityUtils.createJWT(
                        id, "KeepID", username, "Password Reset Confirmation", expirationTime);

        MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
        tokenCollection.replaceOne(
                eq("username", username),
                new Tokens().setUsername(username).setResetJwt(jwt),
                new ReplaceOptions().upsert(true));

        String newPassword = RandomStringUtils.random(10, 48, 122, true, true, null, new SecureRandom());
        String inputString = "{\"newPassword\":" + newPassword + ",\"jwt\":" + jwt + "}";

        when(ctx.body()).thenReturn(inputString);

        AccountSecurityController asc = new AccountSecurityController(db);
        asc.resetPassword.handle(ctx);

        // Check that setting was changed
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", "password-reset-test")).first();

        Argon2 argon2 = Argon2Factory.create();
        char[] newPasswordArr = newPassword.toCharArray();

        String passwordHash = user.getPassword();

        assert(argon2.verify(passwordHash, newPasswordArr));
    }
}
