package Organization.Services;

import Config.Message;
import Config.Service;
import Security.EmailExceptions;
import Security.EmailMessages;
import Security.EmailUtil;
import Security.SecurityUtils;
import User.UserMessage;
import com.mongodb.client.MongoDatabase;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.security.SecureRandom;

@Slf4j
public class InviteUserService implements Service {
  MongoDatabase db;
  JSONArray people;
  String sender;
  String orgName;

  public InviteUserService(MongoDatabase db, JSONArray people, String sender, String orgName) {
    this.db = db;
    this.people = people;
    this.sender = sender;
    this.orgName = orgName;
  }

  @Override
  public Message executeAndGetResponse() {
    if (orgName.isEmpty()) {
      log.error("Empty organization field");
      return UserMessage.EMPTY_FIELD;
    }

    log.info("Checking for empty fields");
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
        log.error("Empty email field");
        return UserMessage.EMPTY_FIELD;
      }
      if (firstName.isEmpty()) {
        log.error("Empty first name field");
        return UserMessage.EMPTY_FIELD;
      }
      if (lastName.isEmpty()) {
        log.error("Empty last name field");
        return UserMessage.EMPTY_FIELD;
      }
      if (role.isEmpty()) {
        log.error("Empty role field");
        return UserMessage.EMPTY_FIELD;
      }
    }

    log.info("Generating JWTs and emails for organization invites");
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
                id,
                sender,
                firstName,
                lastName,
                role,
                "Invite User to Org",
                orgName,
                expirationTime);
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
        log.error("Email exception caught");
        return e;
      } catch (IOException e) {
        return EmailMessages.UNABLE_TO_SEND;
      }
    }

    log.info("All emails sent");
    log.info("Done with inviteUsers");
    return UserMessage.SUCCESS;
  }
}
