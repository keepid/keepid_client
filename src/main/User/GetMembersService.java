package User;

import Config.Message;
import Config.Service;
import com.mongodb.Mongo;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import org.bson.conversions.Bson;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Filters.regex;
import static com.mongodb.client.model.Updates.combine;

public class GetMembersService implements Service {
  MongoDatabase db;
  Logger logger;

  public GetMembersService(MongoDatabase db, Logger logger, String orgName, UserType privilegeLevel, ) {
  }

  @Override
  public Message executeAndGetResponse() {
    if (privilegeLevel == null || orgName == null) {
      logger.error("Session Token Failure");
      ctx.json(UserMessage.SESSION_TOKEN_FAILURE.toJSON().toString());
      return;
    }

    JSONArray members = new JSONArray();
    JSONArray clients = new JSONArray();
    MongoCollection<User> userCollection = db.getCollection("user", User.class);

    Bson orgNameMatch = eq("organization", orgName);
    Bson filter;

    if (!nameSearch.contentEquals("")) {
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

    MongoCursor<User> cursor = userCollection.find(filter).iterator();
    int numClients = 0;
    int numMembers = 0;
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
        numMembers += 1;
      } else if (userType == UserType.Client) {
        clients.put(userJSON);
        numClients += 1;
      }
    }

    JSONArray returnElements;
    int numReturnElements;
    // If Getting Client List
    if (listType.equals("clients")
            && (privilegeLevel == UserType.Worker
            || privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director)) {
      returnElements = getPage(clients, startIndex, endIndex);
      numReturnElements = clients.length();
      // If Getting Worker/Admin List
    } else if (listType.equals("members") && privilegeLevel == UserType.Admin
            || privilegeLevel == UserType.Director) {
      returnElements = getPage(members, startIndex, endIndex);
      numReturnElements = members.length();
    } else {
      logger.error("Insufficient Privilege, Could not return member info");
      ctx.json(UserMessage.INSUFFICIENT_PRIVILEGE.toJSON().toString());
      return;
    }

    res.put("status", UserMessage.SUCCESS.getErrorName());
    res.put("message", UserMessage.SUCCESS.getErrorDescription());
    res.put("people", returnElements);
    res.put("numPeople", numReturnElements);
    ctx.json(res.toString());
    logger.info("Successfully returned member information");
  };
  }
}
