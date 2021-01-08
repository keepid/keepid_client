package User.Services;

import Config.Message;
import Config.Service;
import User.User;
import User.UserMessage;
import User.UserType;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.Objects;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Updates.combine;

public class GetMembersService implements Service {
  MongoDatabase db;
  Logger logger;
  private String orgName;
  private UserType privilegeLevel;
  private String searchValue;
  private ListType listType;
  private JSONArray people;

  public GetMembersService(
      MongoDatabase db,
      Logger logger,
      String searchValue,
      String orgName,
      UserType privilegeLevel,
      String listType) {
    this.db = db;
    this.logger = logger;
    this.searchValue = searchValue;
    this.orgName = orgName;
    this.privilegeLevel = privilegeLevel;
    this.listType = ListType.valueOf(listType);
  }

  public enum ListType {
    CLIENTS,
    MEMBERS;
  }

  @Override
  public Message executeAndGetResponse() {
    if (privilegeLevel == null || orgName == null) {
      logger.error("Session Token Failure");
      return UserMessage.SESSION_TOKEN_FAILURE;
    }
    Objects.requireNonNull(searchValue);
    Objects.requireNonNull(orgName);
    Objects.requireNonNull(privilegeLevel);
    Objects.requireNonNull(listType);
    String[] nameSearchSplit = searchValue.split(" ");
    MongoCollection<User> userCollection = db.getCollection("user", User.class);
    Bson orgNameMatch = eq("organization", orgName);
    Bson filter;

    if (!searchValue.contentEquals("")) {
      filter = regex("firstName", nameSearchSplit[0], "i");
      filter = or(filter, regex("lastName", nameSearchSplit[0], "i"));
      for (int i = 1; i < nameSearchSplit.length; i++) {
        filter = or(filter, regex("firstName", nameSearchSplit[i], "i"));
        filter = or(filter, regex("lastName", nameSearchSplit[i], "i"));
      }
      filter = combine(filter, orgNameMatch);
    } else {
      filter = orgNameMatch;
    }

    JSONArray members = new JSONArray();
    JSONArray clients = new JSONArray();
    MongoCursor<User> cursor = userCollection.find(filter).iterator();
    while (cursor.hasNext()) {
      User user = cursor.next();
      JSONObject userJSON = new JSONObject();
      userJSON.put("username", user.getUsername());
      userJSON.put("privilegeLevel", user.getUserType());
      userJSON.put("firstName", user.getFirstName());
      userJSON.put("lastName", user.getLastName());
      userJSON.put("email", user.getEmail());
      userJSON.put("phone", user.getPhone());
      userJSON.put("address", user.getAddress());
      userJSON.put("city", user.getCity());
      userJSON.put("state", user.getState());
      userJSON.put("zipcode", user.getZipcode());
      UserType userType = user.getUserType();
      logger.info("Getting member information");
      if (userType == UserType.Director
          || userType == UserType.Admin
          || userType == UserType.Worker) {
        members.put(userJSON);
      } else if (userType == UserType.Client) {
        clients.put(userJSON);
      }
    }

    JSONArray people;
    // If Getting Client List
    if (listType == ListType.CLIENTS
        && (privilegeLevel == UserType.Worker
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director)) {
      people = clients;
      // If Getting Worker/Admin List
    } else if (listType == ListType.MEMBERS && privilegeLevel == UserType.Admin
        || privilegeLevel == UserType.Director) {
      people = members;
    } else {
      logger.error("Insufficient Privilege, Could not return member info");
      return UserMessage.INSUFFICIENT_PRIVILEGE;
    }
    this.people = people;
    logger.info("Successfully returned member information");
    return UserMessage.SUCCESS;
  }

  public JSONArray getPeople() {
    Objects.requireNonNull(people);
    return people;
  }
}
