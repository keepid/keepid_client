package User;

import Config.MongoConfig;
import Security.SecurityUtils;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import static com.mongodb.client.model.Filters.eq;

public class CreateDeveloper {

  public static void main(String[] args) throws Validation.ValidationException {
    MongoClient client = MongoConfig.getMongoClient();
    MongoDatabase db = client.getDatabase(MongoConfig.getDatabaseName());
    SecurityUtils securityUtils = new SecurityUtils();

    String firstName = "Steffen";
    String lastName = "Cornwell";
    String birthDate = "07-25-1998";
    String email = "steffencornwell@gmail.com";
    String phone = "4103020506";
    String address = "7145 Deer Valley Road";
    String city = "Highland";
    String state = "MD";
    String zipcode = "20777";
    Boolean twoFactorOn = false;
    String username = "STEFFEN-CORNWELL-DEVELOPER-2";
    String password = "keepid2020";
    UserType userType = UserType.Developer;

    User user =
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
    userCollection.insertOne(user);
    System.out.println(UserMessage.ENROLL_SUCCESS.toJSON().getString("message"));
  }
}
