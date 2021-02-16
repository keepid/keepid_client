package Admin;

import Config.DeploymentLevel;
import Config.Message;
import Config.MongoConfig;
import Database.User.UserDao;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;

public class AdminController {
  UserDao userDao;
  MongoDatabase db;

  public AdminController(UserDao userDao, MongoDatabase db) {
    this.db = MongoConfig.getDatabase(DeploymentLevel.TEST);
    this.userDao = userDao;
    this.db = db;
  }

  // Shows you what you wanna delete before you do it :)
  public Handler testDeleteOrg =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String orgName = req.getString("orgName");

        JSONObject responseBuilder = new JSONObject();

        // Delete orgs
        FakeDeleteOrgService dos = new FakeDeleteOrgService(db, orgName);
        Message responseMessage = dos.executeAndGetResponse();
        if (responseMessage == AdminMessages.SUCCESS) {
          responseBuilder.put("orgs", dos.res);
        }

        // Delete users
        FakeDeleteUserService dus = new FakeDeleteUserService(userDao, orgName);
        responseMessage = dus.executeAndGetResponse();
        if (responseMessage == AdminMessages.SUCCESS) {
          responseBuilder.put("users", dus.res);
        }

        // TODO(xander) enable
        // Delete files
        FakeDeleteFileService files = new FakeDeleteFileService(db, orgName);
        responseMessage = files.executeAndGetResponse();
        if (responseMessage == AdminMessages.SUCCESS) {
          responseBuilder.put("files", files.res);
        }

        // Delete activities
        FakeDeleteActivityService acs = new FakeDeleteActivityService(db, orgName);
        responseMessage = acs.executeAndGetResponse();
        if (responseMessage == AdminMessages.SUCCESS) {
          responseBuilder.put("activities", acs.res);
        }

        ctx.result(responseBuilder.toString());
      };

  public Handler deleteOrg =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String orgName = req.getString("orgName");

        JSONObject responseBuilder = new JSONObject();

        // Delete orgs
        DeleteOrgService dos = new DeleteOrgService(db, orgName);
        Message responseMessage = dos.executeAndGetResponse();
        if (responseMessage != AdminMessages.SUCCESS) {
          ctx.result(responseMessage.toJSON().toString());
          return;
        }

        // Delete users
        DeleteUserService dus = new DeleteUserService(userDao, orgName);
        responseMessage = dus.executeAndGetResponse();
        if (responseMessage != AdminMessages.SUCCESS) {
          ctx.result(responseMessage.toJSON().toString());
          return;
        }

        // TODO(xander) enable
        //         Delete files
        DeleteFileService files = new DeleteFileService(db, orgName);
        responseMessage = files.executeAndGetResponse();
        if (responseMessage != AdminMessages.SUCCESS) {
          ctx.result(responseMessage.toJSON().toString());
          return;
        }

        // Delete activities
        DeleteActivityService acs = new DeleteActivityService(db, orgName);
        responseMessage = acs.executeAndGetResponse();
        if (responseMessage != AdminMessages.SUCCESS) {
          ctx.result(responseMessage.toJSON().toString());
          return;
        }

        ctx.result(responseBuilder.toString());
      };
}
