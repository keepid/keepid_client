package Organization.Services;

import Config.Message;
import Config.Service;
import Security.EmailExceptions;
import Security.EmailMessages;
import Security.EmailUtil;
import Security.SecurityUtils;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.IOException;
import java.security.SecureRandom;

public class InviteUserService implements Service {
  MongoDatabase db;
  Logger logger;
  JSONArray people;
  String sender;
  String org;

  public InviteUserService(
      MongoDatabase db, Logger logger, JSONArray people, String sender, String org) {
    this.db = db;
    this.logger = logger;
    this.people = people;
    this.sender = sender;
    this.org = org;
  }

  @Override
  public Message executeAndGetResponse() {
    if (org.isEmpty()) {
      logger.error("Empty organization field");
      return UserMessage.EMPTY_FIELD;
    }

    logger.info("Checking for empty fields");
    // Checking for any empty entries before sending out any emails
    for (int u = 0; u < people.length(); u++) {

      JSONObject currInvite = people.getJSONObject(u);

      String email = currInvite.getString("email");
      String firstName = currInvite.getString("firstName");
      String lastName = currInvite.getString("lastName");
      String role = currInvite.getString("role");

      // Include checks for empty entries, could potentially include different error messages
      // for
      // each field.
      if (email.isEmpty()) {
        logger.error("Empty email field");
        return UserMessage.EMPTY_FIELD;
      }
      if (firstName.isEmpty()) {
        logger.error("Empty first name field");
        return UserMessage.EMPTY_FIELD;
      }
      if (lastName.isEmpty()) {
        logger.error("Empty last name field");
        return UserMessage.EMPTY_FIELD;
      }
      if (role.isEmpty()) {
        logger.error("Empty role field");
        return UserMessage.EMPTY_FIELD;
      }
    }

    logger.info("Generating JWTs and emails for organization invites");
    for (int i = 0; i < people.length(); i++) {
      JSONObject currInvite = people.getJSONObject(i);

      String email = currInvite.getString("email");
      String firstName = currInvite.getString("firstName");
      String lastName = currInvite.getString("lastName");
      String role = currInvite.getString("role");

      String id = RandomStringUtils.random(25, 48, 122, true, true, null, new SecureRandom());
      int expirationTime = 604800000; // 7 days
      String jwt = null;
      // NEED TO UPDATE URL IN JWT TO ORG INVITE WEBSITE
      try {
        jwt =
            SecurityUtils.createOrgJWT(
                id, sender, firstName, lastName, role, "Invite User to Org", org, expirationTime);
        String emailJWT =
            EmailUtil.getOrganizationInviteEmail(
                "https://keep.id/create-user/" + jwt, sender, firstName + " " + lastName);
        EmailUtil.sendEmail(
            "Keep ID", email, sender + " has Invited you to Join their Organization", emailJWT);
        //          switch (role) {
        //            case: "Worker":
        //              CreateWorkerActivity c = new CreateWorkerActivity()
        //              break;
        //            default:
        //              throw new IllegalStateException("Unexpected value: " + role);
        //          }
      } catch (EmailExceptions e) {
        logger.error("Email exception caught");
        return e;
      } catch (IOException e) {
        return EmailMessages.UNABLE_TO_SEND;
      }
    }

    logger.info("All emails sent");
    logger.info("Done with inviteUsers");
    return UserMessage.SUCCESS;
  }
}
