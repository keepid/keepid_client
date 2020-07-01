package UserTest;

import Config.MongoConfig;
import Security.AccountSecurityController;
import User.User;
import Validation.ValidationUtils;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Context;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Test;

import java.security.SecureRandom;

import static com.mongodb.client.model.Filters.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ChangeAccountSettingsIntegrationTests {
    Context ctx = mock(Context.class);
    MongoClient testClient = MongoConfig.getMongoClient();
    MongoDatabase db = testClient.getDatabase(MongoConfig.getDatabaseName());

    // Make sure to enable .env file configurations for these tests

    private boolean isCorrectAttribute(String username, String attribute, String possibleValue) {
        MongoCollection<User> userCollection = db.getCollection("user", User.class);
        User user = userCollection.find(eq("username", username)).first();

        switch (attribute) {
            case "firstName":
                String currentFirstName = user.getFirstName();
                return (currentFirstName.equals(possibleValue));
            case "lastName":
                String currentLastName = user.getLastName();
                return (currentLastName.equals(possibleValue));
            case "birthDate":
                String currentBirthDate = user.getBirthDate();
                return (currentBirthDate.equals(possibleValue));
            case "phone":
                String currentPhone = user.getPhone();
                return (currentPhone.equals(possibleValue));
            case "email":
                String currentEmail = user.getEmail();
                return (currentEmail.equals(possibleValue));
            case "address":
                String currentAddress = user.getAddress();
                return (currentAddress.equals(possibleValue));
            case "city":
                String currentCity = user.getCity();
                return (currentCity.equals(possibleValue));
            case "state":
                String currentState = user.getState();
                return (currentState.equals(possibleValue));
            case "zipcode":
                String currentZipcode = user.getZipcode();
                return (currentZipcode.equals(possibleValue));
            default:
                return false;
        }
    }

    @Test
    public void changeFirstNameTest() throws Exception {
        String firstName1 = "David";
        String firstName2 = "Sarah";

        String username = "account-settings-test";
        String password = "account-settings-test";

        String newFirstName = firstName2;

        if (isCorrectAttribute(username, "firstName", newFirstName)) {
            newFirstName = firstName1;
        }

        String inputString = "{\"password\":" + password + ",\"key\":\"firstName\",\"value\":" + newFirstName + "}";

        when(ctx.body()).thenReturn(inputString);
        when(ctx.sessionAttribute("username")).thenReturn(username);

        AccountSecurityController asc = new AccountSecurityController(db);
        asc.changeAccountSetting.handle(ctx);

        assert(isCorrectAttribute(username, "firstName", newFirstName));
    }

    @Test
    public void changeLastNameTest() throws Exception {
        String lastName1 = "Smith";
        String lastName2 = "Jones";

        String username = "account-settings-test";
        String password = "account-settings-test";

        String newLastName = lastName2;

        if (isCorrectAttribute(username, "lastName", newLastName)) {
            newLastName = lastName1;
        }

        String inputString = "{\"password\":" + password + ",\"key\":\"lastName\",\"value\":" + newLastName + "}";

        when(ctx.body()).thenReturn(inputString);
        when(ctx.sessionAttribute("username")).thenReturn(username);

        AccountSecurityController asc = new AccountSecurityController(db);
        asc.changeAccountSetting.handle(ctx);

        assert(isCorrectAttribute(username, "lastName", newLastName));
    }
}
