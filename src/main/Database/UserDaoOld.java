package Database;

import Activity.ActivityController;
import Activity.ChangeUserAttributesActivity;
import Activity.PasswordRecoveryActivity;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

import static com.mongodb.client.model.Filters.eq;

public class UserDaoOld {
  public static User findOneUserOrNull(MongoDatabase db, String username) {
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    return userCollection.find(eq("username", username)).first();
  }

  public static void replaceUser(MongoDatabase db, User newUser) {
    db.getCollection("user", User.class).replaceOne(eq("username", newUser.getUsername()), newUser);
  }

  public static void resetPassword(
      MongoDatabase db, User user, String newPassword, String activity) {
    String old = user.getPassword();
    Argon2 argon2 = Argon2Factory.create();
    char[] newPasswordArr = newPassword.toCharArray();
    String passwordHash = argon2.hash(10, 65536, 1, newPasswordArr);
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    userCollection.replaceOne(eq("username", user.getUsername()), user.setPassword(passwordHash));
    argon2.wipeArray(newPasswordArr);

    ActivityController activityController = new ActivityController(db);
    switch (activity) {
      case "PasswordRecoveryActivity":
        PasswordRecoveryActivity passwordRecoveryActivity =
            new PasswordRecoveryActivity(user, old, passwordHash, user.getEmail());
        activityController.addActivity(passwordRecoveryActivity);
        break;
      case "ChangeUserAttributesActivity":
        ChangeUserAttributesActivity changeUserAttributesActivity =
            new ChangeUserAttributesActivity(user, "password", old, passwordHash);
        activityController.addActivity(changeUserAttributesActivity);
        break;
      default:
        throw new IllegalStateException("Unexpected value: " + activity);
    }
  }
}
