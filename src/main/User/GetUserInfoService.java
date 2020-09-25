package User;

import Config.Message;
import Config.Service;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;

import static com.mongodb.client.model.Filters.eq;

public class GetUserInfoService implements Service {
  private MongoDatabase db;
  private Logger logger;
  private String username;
  private User user;
  public GetUserInfoService(MongoDatabase db, Logger logger, String username) {
    this.db = db;
    this.logger = logger;
    this.username = username;
  }
  @Override
  public Message executeAndGetResponse() {
    Objects.requireNonNull(db);
    Objects.requireNonNull(username);
    Objects.requireNonNull(logger);
    User user = findUserOrReturnNull(this.db, this.username);
    if (user == null) {
      logger.error("Session Token Failure");
      return UserMessage.USER_NOT_FOUND;
    } else {
      this.user = user;
      logger.info("Successfully got user info");
      return UserMessage.SUCCESS;
    }
  }

  public JSONObject getUserFields(){
    Objects.requireNonNull(user);
    JSONObject userObject = new JSONObject();
    userObject.put("userRole", this.user.getUserType());
    userObject.put("organization", user.getOrganization());
    userObject.put("firstName", user.getFirstName());
    userObject.put("lastName", user.getLastName());
    userObject.put("birthDate", user.getBirthDate());
    userObject.put("address", user.getAddress());
    userObject.put("city", user.getCity());
    userObject.put("state", user.getState());
    userObject.put("zipcode", user.getZipcode());
    userObject.put("email", user.getEmail());
    userObject.put("phone", user.getPhone());
    userObject.put("twoFactorOn", user.getTwoFactorOn());
    userObject.put("username", user.getUsername());
    return userObject;
  }

  public User findUserOrReturnNull(MongoDatabase db, String username){
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    return userCollection.find(eq("username", username)).first();
  }
}
