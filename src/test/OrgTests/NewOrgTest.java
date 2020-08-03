package OrgTests;

import TestUtils.TestUtils;
import kong.unirest.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.jupiter.api.Assertions.fail;

public class NewOrgTest {
  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.tearDownTestDB();
    try {
      TestUtils.setUpTestDB();
    } catch (Exception e) {
      fail(e);
    }
  }

  @AfterClass
  public static void tearDown() {
    TestUtils.stopServer();
    TestUtils.tearDownTestDB();
  }

  // Again, I commented out the part below as it would notify the slack channel about the new
  // organization.
  // If you wish to run the test, please change the urls in orgController to newOrgTestUrl. If you
  // are not sure
  // which one to put, contact me @cathy chen on slack.
  @Test
  public void testNewOrg() {
    JSONObject body = new JSONObject();
    body.put("firstname", "cat");
    body.put("lastname", "chen");
    body.put("birthDate", "05-23-2002");
    body.put("email", "cat@gmail.com");
    body.put("phonenumber", "412-123-3456");
    body.put("address", "321 RandomStreet");
    body.put("city", "Philadelphia");
    body.put("state", "PA");
    body.put("zipcode", "19104");
    body.put("twoFactorOn", false);
    body.put("username", "chen");
    body.put("password", "09/01/00");
    body.put("organizationName", "SlackTest1");
    body.put("organizationWebsite", "http://keep.id");
    body.put("organizationEIN", "123456789");
    body.put("organizationAddressStreet", "321 RandomStreet");
    body.put("organizationAddressCity", "Philadelphia");
    body.put("organizationAddressState", "PA");
    body.put("organizationAddressZipcode", "19104");
    body.put("organizationEmail", "test@email.com");
    body.put("organizationPhoneNumber", "412-123-3456");

    //    HttpResponse<String> submitResponse =
    //        Unirest.post(TestUtils.getServerUrl() + "/organization-sign-up")
    //            .body(body.toString())
    //            .asString();
    //    assert ("SUCCESSFUL_ENROLLMENT"
    //
    // .equals(TestUtils.responseStringToJSON(submitResponse.getBody()).getString("status")));
  }
}
