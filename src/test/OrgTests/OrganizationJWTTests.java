package OrgTests;

import Security.SecurityUtils;
import Validation.ValidationException;
import io.jsonwebtoken.Claims;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import resources.TestUtils;

import java.io.IOException;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

public class OrganizationJWTTests {
  private SecurityUtils securityUtils = new SecurityUtils();

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

  @Test
  public void checkJWTCreation() throws IOException {
    String id = "1";
    String issuer = "Issuer";
    String subject = "Org Invite";
    String firstName = "First";
    String lastName = "Last";
    String role = "Worker";
    String org = "testOrg";
    int time = 72000;

    String orgJWT =
        securityUtils.createOrgJWT(id, issuer, firstName, lastName, role, subject, org, time);

    Claims decodedClaims = securityUtils.decodeJWT(orgJWT);

    // Testing
    assertEquals(decodedClaims.getId(), id);
    assertEquals(decodedClaims.getIssuer(), issuer);
    assertEquals(decodedClaims.getSubject(), subject);
    assertEquals(decodedClaims.get("firstName"), firstName);
    assertEquals(decodedClaims.get("lastName"), lastName);
    assertEquals(decodedClaims.get("role"), role);
  }

  @Test
  public void organizationInviteValid() {
    JSONObject body = new JSONObject();
    JSONArray dataArray = new JSONArray();
    JSONObject firstUser = new JSONObject();
    JSONObject secUser = new JSONObject();

    // Creating example org workers
    firstUser.put("firstName", "John");
    firstUser.put("lastName", "Smith");
    firstUser.put("email", "test@exampleCompany.com");
    firstUser.put("role", "Worker");

    secUser.put("firstName", "Toph");
    secUser.put("lastName", "Beifong");
    secUser.put("email", "TophRocks@exampleCompany.com");
    secUser.put("role", "Admin");

    dataArray.put(firstUser);
    dataArray.put(secUser);

    body.put("senderName", "Test Sender");
    body.put("organization", "Test Org");
    body.put("data", dataArray);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/invite-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("Success.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  @Test
  public void organizationInviteInvalid() {
    JSONObject body = new JSONObject();
    JSONArray dataArray = new JSONArray();
    JSONObject firstUser = new JSONObject();
    JSONObject secUser = new JSONObject();

    // Creating example org workers with empty first and last name in first worker
    firstUser.put("firstName", "");
    firstUser.put("lastName", "");
    firstUser.put("email", "test@exampleCompany.com");
    firstUser.put("role", "Worker");

    secUser.put("firstName", "Toph");
    secUser.put("lastName", "Beifong");
    secUser.put("email", "TophRocks@exampleCompany.com");
    secUser.put("role", "Admin");

    dataArray.put(firstUser);
    dataArray.put(secUser);

    body.put("senderName", "Test Sender");
    body.put("organization", "Test Org");
    body.put("data", dataArray);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/invite-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("Cannot be empty.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("EMPTY_FIELD");
  }

  @Test
  public void adminDashboardTest() {
    TestUtils.login("adminBSM", "adminBSM");
    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/dashboard")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    TestUtils.logout();

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Success.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("SUCCESS");
    assert (resp.has("workerCount"));
    assertThat(resp.getInt("workerCount")).isEqualTo(7);
    assert (resp.has("clientCount"));
    assertThat(resp.getInt("clientCount")).isEqualTo(0);
  }

  @Test
  public void findAllOrgs() throws ValidationException {
    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/all-orgs")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    //    Organization broadStreetMinistry =
    //        new Organization(
    //            "Broad Street Ministry",
    //            "http://www.broadstreetministry.org",
    //            "123456789",
    //            "311 Broad Street",
    //            "Philadelphia",
    //            "PA",
    //            "19104",
    //            "mikedahl@broadstreetministry.org",
    //            "1234567890");
    //
    //    Organization ymca =
    //        new Organization(
    //            "YMCA",
    //            "http://www.ymca.net",
    //            "987654321",
    //            "11088 Knights Rd",
    //            "Philadelphia",
    //            "PA",
    //            "19154",
    //            "info@ymca.net",
    //            "1234567890");
    //
    //    Organization twoFactorTokenOrg =
    //        new Organization(
    //            "2FA Token Org",
    //            "http://keep.id",
    //            "123456789",
    //            "311 Broad Street",
    //            "Philadelphia",
    //            "PA",
    //            "19104",
    //            "contact@example.com",
    //            "1234567890");
    //
    //    Organization accountSettingsOrg =
    //        new Organization(
    //            "Account Settings Org",
    //            "http://keep.id",
    //            "123456789",
    //            "311 Broad Street",
    //            "Philadelphia",
    //            "PA",
    //            "19104",
    //            "contact@example.com",
    //            "1234567890");
    //
    //    Organization passwordSettingsOrg =
    //        new Organization(
    //            "Password Settings Org",
    //            "http://keep.id",
    //            "123456789",
    //            "311 Broad Street",
    //            "Philadelphia",
    //            "PA",
    //            "19104",
    //            "contact@example.com",
    //            "1234567890");

    String testOrgs[] = {
      "Broad Street Ministry",
      "YMCA",
      "2FA Token Org",
      "Account Settings Org",
      "Password Settings Org"
    };

    JSONArray orgs = resp.getJSONArray("organizations");

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Success.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("SUCCESS");
    assert (resp.has("organizations"));

    for (int i = 0; i < orgs.length(); i++) {
      JSONObject currOrg = orgs.getJSONObject(i);
      String orgName = currOrg.getString("orgName");
      assert (Arrays.asList(testOrgs).contains(orgName));
    }
  }
}
