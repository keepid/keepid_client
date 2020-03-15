package Organization;

import static org.junit.jupiter.api.Assertions.assertEquals;

import Config.MongoConfig;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;
import java.util.HashMap;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class OrganizationControllerTest {

  private static MongoDatabase database;

  @BeforeAll
  static void setUp() {
    MongoConfig.startTestConnection();
    database = MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
  }

  @AfterAll
  public static void tearDown() {
    MongoConfig.closeTestConnection();
  }

  public static HashMap<String, String> loadExampleOrg1() {
    HashMap<String, String> exampleOrg1 = new HashMap<>();
    exampleOrg1.put("orgName", "exampleOrgName");
    exampleOrg1.put("orgWebsite", "https://www.exampleOrgWebsite1.org");
    exampleOrg1.put("name", "adminNameHere");
    exampleOrg1.put("username", "adminNameHere");
    exampleOrg1.put("password", "adminPasswordHere");
    exampleOrg1.put("phone", "1110001111");
    exampleOrg1.put("email", "exampleOrg1@example.com");
    exampleOrg1.put("city", "philadelphia");
    exampleOrg1.put("state", "PA");
    exampleOrg1.put("address", "exampleAddress");
    exampleOrg1.put("zipcode", "19104");
    exampleOrg1.put("taxCode", "501c3");
    exampleOrg1.put("numUsers", "1000");
    return exampleOrg1;
  }

  // all the tests i want to make
  // create empty org
  // recreate all error exceptions- check validation
  // create org with existing information

  @Test
  void signUpValidOrg() throws Exception {
    HttpServletRequest req = Mockito.spy(HttpServletRequest.class);
    HttpServletResponse res = Mockito.spy(HttpServletResponse.class);
    Context context = Mockito.spy(ContextUtil.init(req, res));
    System.out.println("here1");
    Mockito.when(context.req.getInputStream()).thenReturn(Mockito.spy(ServletInputStream.class));
    System.out.println("here2");
    JSONObject obj = new JSONObject(loadExampleOrg1());
    System.out.println("here3");
    Mockito.when(context.body()).thenReturn(obj.toString());
    System.out.println("here4");
    OrganizationController orgController = new OrganizationController(database);
    System.out.println("here5");
    orgController.enrollOrganization.handle(context);
    System.out.println("here6: " + context.resultString());
    assertEquals(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString(), context.resultString());
  }
  //
  //  @Test
  //  void signUpInValidOrgMissingName() throws Exception {
  //    HttpServletRequest req = mock(HttpServletRequest.class);
  //    HttpServletResponse res = mock(HttpServletResponse.class);
  //    Context context = ContextUtil.init(req, res);
  //    // load all params except orgname
  //    HashMap<String, String> exampleOrgLoad1 = loadExampleOrg1();
  //    exampleOrgLoad1.put("orgName", null);
  //    JSONObject obj = new JSONObject(loadExampleOrg1());
  //    Mockito.when(context.body()).thenReturn(obj.toString());
  //    OrganizationController orgController = new OrganizationController(database);
  //    orgController.enrollOrganization.handle(context);
  //    assertEquals(OrgEnrollmentStatus.INVALID_PARAMETER.toString(), context.resultString());
  //  }

  @AfterEach
  public void resetDB() {
    MongoConfig.cleanTestDatabase();
  }
}
