package Production;

import Database.Organization.OrgDao;
import Database.User.UserDao;
import Organization.Organization;
import Organization.Requests.OrganizationCreateRequest;
import Organization.Requests.OrganizationUpdateRequest;
import Security.SecurityUtils;
import User.Requests.UserCreateRequest;
import User.Requests.UserUpdateRequest;
import User.User;
import io.javalin.http.Handler;
import io.javalin.http.HttpResponseException;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.json.JSONArray;

import java.util.Date;
import java.util.HashMap;
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
        OrganizationCreateRequest organizationCreateRequest = ctx.bodyAsClass(OrganizationCreateRequest.class);

        if (orgDao.get(organizationCreateRequest.getOrgName()).isPresent()) {
          throw new HttpResponseException(409, "Organization with orgName '" + organizationCreateRequest.getOrgName() + "' already exists", new HashMap<>());
        }

        Organization organization = new Organization(
            organizationCreateRequest.getOrgName(),
            organizationCreateRequest.getOrgWebsite(),
            organizationCreateRequest.getOrgEIN(),
            organizationCreateRequest.getOrgStreetAddress(),
            organizationCreateRequest.getOrgCity(),
            organizationCreateRequest.getOrgState(),
            organizationCreateRequest.getOrgZipcode(),
            organizationCreateRequest.getOrgEmail(),
            organizationCreateRequest.getOrgPhoneNumber());

        orgDao.save(organization);

        ctx.status(201).json(organization.serialize().toMap());
      };

  public Handler readOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        Optional<Organization> organizationOptional = orgDao.get(objectId);
        organizationOptional.ifPresent(organization -> ctx.json(organization.serialize().toMap()));
      };

  public Handler updateOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        var updateRequest = ctx.bodyAsClass(OrganizationUpdateRequest.class);

        Optional<Organization> organizationOptional = orgDao.get(objectId);
        organizationOptional.ifPresent(value -> {
          var organization = value.updateProperties(updateRequest);
          orgDao.update(organization);
          ctx.json(organization.serialize().toMap());
        });
      };

  public Handler deleteOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        orgDao.delete(objectId);
        ctx.status(204);
      };

  public Handler readAllOrgs =
      ctx -> {
        var orgs = new JSONArray(orgDao.getAll().stream().map(org -> org.serialize()).toArray()).toList();
        ctx.json(orgs);
      };

  public Handler getUsersFromOrg =
      ctx -> {
        ObjectId objectId = new ObjectId(ctx.pathParam("orgId"));
        var users = new JSONArray(userDao.getAllFromOrg(objectId).stream().map(u -> u.serialize()).toArray()).toList();
        ctx.json(users);
      };

  public Handler createUser =
      ctx -> {
        UserCreateRequest userCreateRequest = ctx.bodyAsClass(UserCreateRequest.class);
        User user = new User(
            userCreateRequest.getFirstName(),
            userCreateRequest.getLastName(),
            userCreateRequest.getBirthDate(),
            userCreateRequest.getEmail(),
            userCreateRequest.getPhone(),
            userCreateRequest.getOrganization(),
            userCreateRequest.getAddress(),
            userCreateRequest.getCity(),
            userCreateRequest.getState(),
            userCreateRequest.getZipcode(),
            false,
            userCreateRequest.getUsername(),
            userCreateRequest.getPassword(),
            userCreateRequest.getUserType()
        );
        user.setId(new ObjectId());
        user.setCreationDate(new Date());
        String hashedPassword = SecurityUtils.hashPassword(user.getPassword());
        user.setPassword(hashedPassword);

        if (userDao.get(user.getUsername()).isPresent()) {
          throw new HttpResponseException(409, "User with username '" + user.getUsername() + "' already exists", new HashMap<>());
        }

        if (user.getOrganization() == null) {
          throw new HttpResponseException(400, "Organization required", new HashMap<>());
        }

        if (orgDao.get(user.getOrganization()).isEmpty()) {
          throw new HttpResponseException(400, "Specified Organization does not exist", new HashMap<>());
        }

        userDao.save(user);
        ctx.status(201).json(user.serialize().toMap());
      };

  public Handler readUser =
      ctx -> {
        Optional<User> userOptional = userDao.get(ctx.pathParam("username"));
        userOptional.ifPresent(user -> ctx.json(user.serialize().toMap()));
      };

  public Handler updateUser =
      ctx -> {

        Optional<User> userOptional = userDao.get(ctx.pathParam("username"));
        var updateRequest = ctx.bodyAsClass(UserUpdateRequest.class);

        userOptional.ifPresent(value -> {
          var user = value.updateProperties(updateRequest);
          userDao.update(user);
          ctx.json(user.serialize().toMap());
        });
      };

  public Handler deleteUser =
      ctx -> {
        userDao.delete(ctx.pathParam("username"));
        ctx.status(204);
      };

  public Handler readAllUsers =
      ctx -> {
        var users = new JSONArray(userDao.getAll().stream().map(user -> user.serialize()).toArray()).toList();
        ctx.json(users);
      };
}
