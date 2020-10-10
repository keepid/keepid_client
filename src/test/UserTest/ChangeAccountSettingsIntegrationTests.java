package UserTest;

import Activity.ChangeUserAttributesActivity;
import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.AccountSecurityController;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;

import static com.mongodb.client.model.Filters.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ChangeAccountSettingsIntegrationTests {
  Context ctx = mock(Context.class);
  static MongoDatabase db;
  //  static EncryptionUtils encryptionUtils;

  @BeforeClass
  public static void setUp() throws GeneralSecurityException, IOException {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    db = MongoConfig.getDatabase(DeploymentLevel.TEST);
    //    encryptionUtils = TestUtils.getEncryptionUtils();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  // Make sure to enable .env file configurations for these tests
  // TODO: Swap new SecurityUtils() for a mock that correctly (or incorrectly hashes passwords.

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
        String currentZipcodeFormatted = "\"" + currentZipcode + "\"";
        return (currentZipcodeFormatted.equals(possibleValue));
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

    String inputString =
        "{\"password\":" + password + ",\"key\":\"firstName\",\"value\":" + newFirstName + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    TestUtils.login("account-settings-test", "account-settings-test");
    HttpResponse findResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-all-activities").asString();
    assert (findResponse
        .getBody()
        .toString()
        .contains(ChangeUserAttributesActivity.class.getSimpleName()));
    TestUtils.logout();
    assert (isCorrectAttribute(username, "firstName", newFirstName));
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

    String inputString =
        "{\"password\":" + password + ",\"key\":\"lastName\",\"value\":" + newLastName + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "lastName", newLastName));
  }

  @Test
  public void changeBirthDateTest() throws Exception {
    String birthDate1 = "01-25-1965";
    String birthDate2 = "05-23-2002";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newBirthDate = birthDate2;

    if (isCorrectAttribute(username, "birthDate", newBirthDate)) {
      newBirthDate = birthDate1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"birthDate\",\"value\":" + newBirthDate + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);
    TestUtils.login("account-settings-test", "account-settings-test");
    HttpResponse findResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-all-activities").asString();
    assert (findResponse.getBody().toString().contains("password"));
    TestUtils.logout();
    assert (isCorrectAttribute(username, "birthDate", newBirthDate));
  }

  @Test
  public void changePhoneTest() throws Exception {
    String phone1 = "215-123-4567";
    String phone2 = "412-123-3456";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newPhone = phone2;

    if (isCorrectAttribute(username, "phone", newPhone)) {
      newPhone = phone1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"phone\",\"value\":" + newPhone + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "phone", newPhone));
  }

  @Test
  public void changeEmailTest() throws Exception {
    String email1 = "contact1@example.com";
    String email2 = "contact2@example.com";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newEmail = email2;

    if (isCorrectAttribute(username, "email", newEmail)) {
      newEmail = email1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"email\",\"value\":" + newEmail + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);
    TestUtils.login("account-settings-test", "account-settings-test");
    HttpResponse findResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-all-activities").asString();
    assert (findResponse.getBody().toString().contains(newEmail));
    TestUtils.logout();
    assert (isCorrectAttribute(username, "email", newEmail));
  }

  @Test
  public void changeAddressTest() throws Exception {
    String address1 = "123 SampleStreet";
    String address2 = "321 RandomStreet";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newAddress = address2;

    if (isCorrectAttribute(username, "address", newAddress)) {
      newAddress = address1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"address\",\"value\":" + newAddress + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "address", newAddress));
  }

  @Test
  public void changeCityTest() throws Exception {
    String city1 = "SampleCity";
    String city2 = "RandomCity";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newCity = city2;

    if (isCorrectAttribute(username, "city", newCity)) {
      newCity = city1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"city\",\"value\":" + newCity + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "city", newCity));
  }

  @Test
  public void changeStateTest() throws Exception {
    String state1 = "PA";
    String state2 = "GA";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newState = state2;

    if (isCorrectAttribute(username, "state", newState)) {
      newState = state1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"state\",\"value\":" + newState + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "state", newState));
  }

  @Test
  public void changeZipcodeTest() throws Exception {
    String zipcode1 = "\"19091\"";
    String zipcode2 = "\"19012\"";

    String username = "account-settings-test";
    String password = "account-settings-test";

    String newZipcode = zipcode2;

    if (isCorrectAttribute(username, "zipcode", newZipcode)) {
      newZipcode = zipcode1;
    }

    String inputString =
        "{\"password\":" + password + ",\"key\":\"zipcode\",\"value\":" + newZipcode + "}";

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);

    AccountSecurityController asc = new AccountSecurityController(db);
    asc.changeAccountSetting.handle(ctx);

    assert (isCorrectAttribute(username, "zipcode", newZipcode));
  }
}
