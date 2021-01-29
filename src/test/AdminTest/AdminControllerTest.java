package AdminTest;

import Activity.Activity;
import Config.DeploymentLevel;
import Config.MongoConfig;
import Database.Token.TokenDao;
import Database.Token.TokenDaoFactory;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import Organization.Organization;
import PDF.PDFType;
import PDF.Services.UploadPDFService;
import Security.AccountSecurityController;
import TestUtils.EntityFactory;
import TestUtils.TestUtils;
import User.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import io.javalin.http.Context;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.bson.Document;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class AdminControllerTest {
  Context ctx = mock(Context.class);
  MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);
  UserDao userDao = UserDaoFactory.create(DeploymentLevel.TEST);
  TokenDao tokenDao = TokenDaoFactory.create(DeploymentLevel.TEST);

  public static String resourcesFolderPath =
      Paths.get("").toAbsolutePath().toString()
          + File.separator
          + "src"
          + File.separator
          + "test"
          + File.separator
          + "resources";

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.tearDownTestDB();
  }

  @BeforeEach
  public void populateData() throws Exception {
    String username = "admin-test";
    String password = "admin-test";

    String inputString =
        "{\"password\":" + password + ",\"key\":\"firstName\",\"value\":" + username + "}";

    Organization org = EntityFactory.createOrganization().build();
    User user = EntityFactory.createUser().build();

    when(ctx.body()).thenReturn(inputString);
    when(ctx.sessionAttribute("username")).thenReturn(username);
    when(ctx.sessionAttribute("orgName")).thenReturn(org.getOrgName());
    when(ctx.sessionAttribute("privilegeLevel")).thenReturn(user.getUserType());

    AccountSecurityController asc = new AccountSecurityController(userDao, tokenDao);
    asc.changeAccountSetting.handle(ctx);

    TestUtils.login("admin-test", "admin-test");

    MongoCollection<Organization> organizationMongoCollection =
        db.getCollection("organization", Organization.class);
    organizationMongoCollection.insertOne(EntityFactory.createOrganization().build());

    MongoCollection<User> userMongoCollection = db.getCollection("user", User.class);
    userMongoCollection.insertOne(EntityFactory.createUser().build());

    MongoCollection<Activity> activityMongoCollection =
        db.getCollection("activity", Activity.class);
    activityMongoCollection.insertOne(EntityFactory.createActivity().build());

    PDFType pdfType = PDFType.FORM;
    GridFSBucket gridBucket = GridFSBuckets.create(db, pdfType.toString());
    String fileName = resourcesFolderPath + File.separator + "CIS_401_Final_Progress_Report.pdf";
    InputStream file = new FileInputStream(fileName);
    GridFSUploadOptions options =
        new GridFSUploadOptions()
            .chunkSizeBytes(UploadPDFService.CHUNK_SIZE_BYTES)
            .metadata(
                new Document("type", "pdf")
                    .append("upload_date", String.valueOf(LocalDate.now()))
                    .append("title", "test")
                    .append("annotated", false)
                    .append("uploader", username)
                    .append("organizationName", org.getOrgName()));
    gridBucket.uploadFromStream(fileName, file, options);

    TestUtils.logout();
  }

  @Test
  public void testTestUtil() {
    JSONObject body = new JSONObject();
    body.put("orgName", "Broad Street Ministry");
    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/test-delete-org")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();
    assertEquals(200, actualResponse.getStatus());
  }

  @Test
  public void testEndpoint() {
    JSONObject body = new JSONObject();
    body.put("orgName", "Broad Street Ministry");
    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/delete-org")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();
    assertEquals(200, actualResponse.getStatus());
    MongoCollection<Organization> organizationMongoCollection =
        db.getCollection("organization", Organization.class);
    assertEquals(
        0,
        organizationMongoCollection
            .find(Filters.eq("orgName", "Broad Street Ministry"))
            .into(new ArrayList<>())
            .size());
  }
}
