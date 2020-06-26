package UserTest;

import Config.MongoConfig;
import Security.AccountSecurityController;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.Javalin;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static com.mongodb.client.model.Filters.eq;
import static org.assertj.core.api.Assertions.assertThat;

public class ChangeTwoFactorSettingIntegrationTests {
    private static Javalin app = Javalin.create();

    @BeforeClass
    public static void setUp() {
        MongoClient testClient = MongoConfig.getMongoClient();
        MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

        AccountSecurityController asc = new AccountSecurityController(db);

        app.start(1234);
        app.post("/change-two-factor-setting", asc.change2FASetting);
    }

    @AfterClass
    public static void tearDown() {
        app.stop();
    }

    @Test
    public void changeTwoFactorFromOffToOnTest() {
        MongoClient testClient = MongoConfig.getMongoClient();
        MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

        JSONObject body = new JSONObject();
        body.put("twoFactorOn", true);

        HttpResponse actualResponse =
                Unirest.post("http://localhost:1234/two-factor")
                        .header("Accept", "*/*")
                        .header("Content-Type", "text/plain")
                        .body(body.toString())
                        .asString();

        JSONObject actualResponseJSON =
                TestUtils.responseStringToJSON(actualResponse.getBody().toString());

        assert (actualResponseJSON.has("status"));
        assertThat(actualResponseJSON.getString("status")).isEqualTo("Success.");

        String username = "twofactorsettingtest-1";
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        assert (user.getTwoFactorOn() == true);
    }

    @Test
    public void verifyUserWithNoTokenTest() {
        JSONObject body = new JSONObject();
        body.put("username", "tokentest-notoken");
        body.put("token", "000000");

        HttpResponse actualResponse =
                Unirest.post("http://localhost:1234/two-factor")
                        .header("Accept", "*/*")
                        .header("Content-Type", "text/plain")
                        .body(body.toString())
                        .asString();

        JSONObject actualResponseJSON =
                TestUtils.responseStringToJSON(actualResponse.getBody().toString());

        assert (actualResponseJSON.has("message"));
        assertThat(actualResponseJSON.getString("message")).isEqualTo("2fa token not found for user.");
        assert (actualResponseJSON.has("status"));
        assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
    }

    @Test
    public void verifyUserWithIncorrectTokenTest() {
        JSONObject body = new JSONObject();
        body.put("username", "tokentest-valid");
        body.put("token", "000000");

        HttpResponse actualResponse =
                Unirest.post("http://localhost:1234/two-factor")
                        .header("Accept", "*/*")
                        .header("Content-Type", "text/plain")
                        .body(body.toString())
                        .asString();

        JSONObject actualResponseJSON =
                TestUtils.responseStringToJSON(actualResponse.getBody().toString());

        assert (actualResponseJSON.has("message"));
        assertThat(actualResponseJSON.getString("message")).isEqualTo("Invalid 2fa token.");
        assert (actualResponseJSON.has("status"));
        assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
    }

    @Test
    public void verifyUserWithExpiredTokenTest() {
        JSONObject body = new JSONObject();
        body.put("username", "tokentest-expired");
        body.put("token", "123123");

        HttpResponse actualResponse =
                Unirest.post("http://localhost:1234/two-factor")
                        .header("Accept", "*/*")
                        .header("Content-Type", "text/plain")
                        .body(body.toString())
                        .asString();

        JSONObject actualResponseJSON =
                TestUtils.responseStringToJSON(actualResponse.getBody().toString());

        assert (actualResponseJSON.has("message"));
        assertThat(actualResponseJSON.getString("message")).isEqualTo("2FA link expired.");
        assert (actualResponseJSON.has("status"));
        assertThat(actualResponseJSON.getString("status")).isEqualTo("AUTH_FAILURE");
    }
}
