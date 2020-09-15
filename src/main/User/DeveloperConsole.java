package User;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.EncryptionController;
import Security.GoogleCredentials;
import Security.SecurityUtils;
import Validation.ValidationException;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.json.simple.parser.ParseException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Scanner;

import static com.mongodb.client.model.Filters.eq;

public class DeveloperConsole {

  public static void main(String[] args)
      throws Validation.ValidationException, GeneralSecurityException, IOException, ParseException {

    Scanner scanner = new Scanner(System.in);
    System.out.println("Please Select an Option for the Developer Console: ");
    System.out.println("1 - Create New Developer Account");
    System.out.println("2 - Generate a New Encryption Key");
    int optionSelected = scanner.nextInt();
    if (optionSelected == 1) {
      createDeveloper();
    } else if (optionSelected == 2) {
      createNewEncryptionKey();
    } else {
      System.out.println("Invalid Option");
    }
  }

  public static void createDeveloper() throws GeneralSecurityException, IOException {

    MongoConfig.getMongoClient();
    MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.STAGING);
    SecurityUtils securityUtils = new SecurityUtils();
    EncryptionController encryptionController = new EncryptionController(db);

    Scanner scanner = new Scanner(System.in);
    System.out.println("Please Enter your First Name: ");
    String firstName = scanner.nextLine();
    System.out.println("Please Enter your Last Name: ");
    String lastName = scanner.nextLine();
    System.out.println("Please Enter your Birthday in the Format (DD-MM-YYYY): ");
    String birthDate = scanner.nextLine();
    System.out.println("Please Enter your Email: ");
    String email = scanner.nextLine();
    System.out.println("Please Enter your Phone Number: ");
    String phone = scanner.nextLine();
    System.out.println("Please Enter your Street Address (NOT INCLUDING City, State, Zipcode): ");
    String address = scanner.nextLine();
    System.out.println("Please Enter your City: ");
    String city = scanner.nextLine();
    System.out.println("Please Enter your State: ");
    String state = scanner.nextLine();
    System.out.println("Please Enter your Zipcode: ");
    String zipcode = scanner.nextLine();
    System.out.println(
        "Please Enter your Preference for Two-Factor Authentication (ONLY TYPE true or false): ");
    Boolean twoFactorOn = scanner.nextBoolean();
    scanner.nextLine();
    System.out.println("Please Enter your Chosen Username: ");
    String username = scanner.nextLine();
    System.out.println("Please Enter your Password: ");
    String password = scanner.nextLine();
    System.out.println("Please Enter your Password (to Confirm): ");
    String confirmPassword = scanner.nextLine();
    while (!password.equals(confirmPassword)) {
      System.out.println("Passwords do not match");
      System.out.println("Please Enter your Password: ");
      password = scanner.nextLine();
      System.out.println("Please Enter your Password (to Confirm): ");
      confirmPassword = scanner.nextLine();
    }
    UserType userType = UserType.Developer;

    User user;
    try {
      user =
          new User(
              firstName,
              lastName,
              birthDate,
              email,
              phone,
              "Team Keep",
              address,
              city,
              state,
              zipcode,
              twoFactorOn,
              username,
              password,
              userType);
    } catch (ValidationException ve) {
      System.out.println(ve.getJSON().toString());
      return;
    }

    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    User existingUser = userCollection.find(eq("username", user.getUsername())).first();

    if (existingUser != null) {
      System.out.println(UserMessage.USERNAME_ALREADY_EXISTS.toJSON().getString("message"));
      return;
    }

    String hash = securityUtils.hashPassword(password);
    if (hash == null) {
      System.out.println(UserMessage.HASH_FAILURE.toJSON().getString("message"));
      return;
    }

    user.setPassword(hash);
    encryptionController.encryptUser(user, username);
    userCollection.insertOne(user);
    System.out.println(UserMessage.ENROLL_SUCCESS.toJSON().getString("message"));
  }

  public static void createNewEncryptionKey()
      throws GeneralSecurityException, IOException, ParseException {
    GoogleCredentials.generateAndUploadEncryptionKey(DeploymentLevel.STAGING);
    System.out.println("Successful Key Creation");
  }
}
