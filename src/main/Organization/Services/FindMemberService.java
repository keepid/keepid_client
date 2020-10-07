package Organization.Services;

import Config.Message;
import Config.Service;
import User.User;
import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class FindMemberService implements Service {
  MongoDatabase db;
  Logger logger;
  JSONArray userTypes;
  JSONArray orgs;
  JSONObject res = null;

  public FindMemberService(MongoDatabase db, Logger logger, JSONArray userTypes, JSONArray orgs) {
    this.db = db;
    this.logger = logger;
    this.userTypes = userTypes;
    this.orgs = orgs;
  }

  @Override
  public Message executeAndGetResponse() {
    if (userTypes.isEmpty()) {
      logger.error("userTypes cannot be empty");
      return UserMessage.EMPTY_FIELD;
    }
    MongoCollection<User> userCollection = db.getCollection("user", User.class);

    logger.info("Counting usertypes");
    if (orgs.isEmpty()) {
      res = emptyOrgCountMembers(userTypes, userCollection);
    } else {
      res = numOrgCountMembers(userTypes, orgs, userCollection);
    }
    if (res.has("fail")) {
      String invalidType = res.getString("invalidType");
      logger.error("Invalid Usertype: " + invalidType);
      res = null;
      return UserMessage.INVALID_PARAMETER;
    }
    logger.info("Successfully returned member information");
    return UserMessage.SUCCESS;
  }

  public JSONObject getMembers() {
    return res;
  }

  private static JSONObject emptyOrgCountMembers(
      JSONArray userTypes, MongoCollection<User> userCollection) {
    JSONObject ret = new JSONObject();
    for (int i = 0; i < userTypes.length(); i++) {
      String currType = userTypes.getString(i);
      switch (currType) {
        case "client":
          long client = userCollection.countDocuments(eq("privilegeLevel", "Client"));
          ret.put("clients", client);
          break;
        case "worker":
          long worker = userCollection.countDocuments(eq("privilegeLevel", "Worker"));
          ret.put("workers", worker);
          break;
        case "admin":
          long admin = userCollection.countDocuments(eq("privilegeLevel", "Admin"));
          ret.put("admins", admin);
          break;
        case "director":
          long director = userCollection.countDocuments(eq("privilegeLevel", "Director"));
          ret.put("directors", director);
          break;
        default:
          ret.put("fail", "True");
          ret.put("invalidType", currType);
          return ret;
      }
    }
    return ret;
  }

  private static JSONObject numOrgCountMembers(
      JSONArray userTypes, JSONArray orgs, MongoCollection<User> userCollection) {
    JSONObject ret = new JSONObject();
    List<String> typesList = new ArrayList<String>();
    long client = 0;
    long worker = 0;
    long admin = 0;
    long director = 0;
    for (int i = 0; i < orgs.length(); i++) {
      for (int u = 0; u < userTypes.length(); u++) {
        String currType = userTypes.getString(u);
        String currOrg = orgs.getString(i);
        typesList.add(currType);
        switch (currType) {
          case "client":
            client +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Client")));
            break;
          case "worker":
            worker +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Worker")));
            break;
          case "admin":
            admin +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Admin")));
            break;
          case "director":
            director +=
                userCollection.countDocuments(
                    and(eq("organization", currOrg), eq("privilegeLevel", "Director")));
            break;
          default:
            ret.put("fail", "True");
            ret.put("invalidType", currType);
            return ret;
        }
      }
    }

    if (typesList.contains("client")) {
      ret.put("clients", client);
    }
    if (typesList.contains("worker")) {
      ret.put("workers", worker);
    }
    if (typesList.contains("admin")) {
      ret.put("admins", admin);
    }
    if (typesList.contains("director")) {
      ret.put("directors", director);
    }

    return ret;
  }
}
