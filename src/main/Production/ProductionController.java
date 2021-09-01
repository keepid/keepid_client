package Production;

import Database.Organization.OrgDao;
import Database.User.UserDao;
import Organization.Organization;
import User.User;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;

import java.util.Optional;

@Slf4j
public class ProductionController {

  private OrgDao orgDao;
  private UserDao userDao;

  public ProductionController(OrgDao orgDao, UserDao userDao) {
    this.orgDao = orgDao;
    this.userDao = userDao;
  }

  public Handler createOrg =
      ctx -> {
        Organization organization = ctx.bodyAsClass(Organization.class);
        organization.setId(new ObjectId());
        orgDao.save(organization);
      };

  public Handler readOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        Optional<Organization> organizationOptional = orgDao.get(objectId);
        organizationOptional.ifPresent(organization -> ctx.result(organization.toString()));
      };

  public Handler updateOrg =
      ctx -> {
        Organization organization = ctx.bodyAsClass(Organization.class);
        orgDao.update(organization);
      };

  public Handler deleteOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        orgDao.delete(objectId);
      };

  public Handler readAllOrgs =
      ctx -> {
        ctx.result(orgDao.getAll().toString());
      };

  public Handler getUsersFromOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("org"));
        ctx.result(userDao.getAllFromOrg(objectId).toString());
      };

  public Handler createUser =
      ctx -> {
        User user = ctx.bodyAsClass(User.class);
        user.setId(new ObjectId());
        userDao.save(user);
      };

  public Handler readUser =
      ctx -> {
        Optional<User> userOptional = userDao.get(ctx.pathParam("username"));
        userOptional.ifPresent(user -> ctx.result(user.toString()));
      };

  public Handler updateUser =
      ctx -> {
        User user = ctx.bodyAsClass(User.class);
        userDao.update(user);
      };

  public Handler deleteUser =
      ctx -> {
        userDao.delete(ctx.pathParam("username"));
      };

  public Handler readAllUsers =
      ctx -> {
        ctx.result(userDao.getAll().toString());
      };
}
