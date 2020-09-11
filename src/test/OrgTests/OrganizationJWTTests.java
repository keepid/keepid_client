package OrgTests;

import Security.SecurityUtils;
import TestUtils.TestUtils;
import Validation.ValidationException;
import io.jsonwebtoken.Claims;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;

public class OrganizationJWTTests {
  private SecurityUtils securityUtils = new SecurityUtils();

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
  }

  @AfterClass
  public static void tearDown() {
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

    body.put("data", dataArray);

    // TestUtils.login("adminBSM", "adminBSM");
    TestUtils.login("testDirector2", "testDirector2");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/invite-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    TestUtils.logout();

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

    body.put("data", dataArray);

    // TestUtils.login("adminBSM", "adminBSM");
    TestUtils.login("testDirector2", "testDirector2");

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/invite-user")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    TestUtils.logout();

    JSONObject actualResponseJSON =
        TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (actualResponseJSON.has("message"));
    assertThat(actualResponseJSON.getString("message")).isEqualTo("Cannot be empty.");
    assert (actualResponseJSON.has("status"));
    assertThat(actualResponseJSON.getString("status")).isEqualTo("EMPTY_FIELD");
  }
  //  {userTypes : ["worker", "director"],
  //  organizations : []}
  @Test
  public void invalidQueryTest() {
    JSONObject body = new JSONObject();
    JSONArray orgs = new JSONArray();
    JSONArray userTypes = new JSONArray();

    body.put("userTypes", userTypes);
    body.put("organizations", orgs);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-usertype-count")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Cannot be empty.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("EMPTY_FIELD");
  }

  @Test
  public void invalidUserType() {
    JSONObject body = new JSONObject();
    JSONArray orgs = new JSONArray();
    JSONArray userTypes = new JSONArray();

    userTypes.put("invalid");
    userTypes.put("director");
    body.put("userTypes", userTypes);
    body.put("organizations", orgs);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-usertype-count")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Please check your parameter");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("INVALID_PARAMETER");
  }

  //  {userTypes : ["worker", "director"],
  //  organizations : []}
  @Test
  public void queryNoOrgsTest() {
    JSONObject body = new JSONObject();
    JSONArray orgs = new JSONArray();
    JSONArray userTypes = new JSONArray();

    userTypes.put("worker");
    userTypes.put("director");
    body.put("userTypes", userTypes);
    body.put("organizations", orgs);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-usertype-count")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Success.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("SUCCESS");
    assert (resp.has("workers"));
    // assertThat(resp.getInt("workers")).isEqualTo(12);
    assert (resp.has("directors"));
    // assertThat(resp.getInt("directors")).isEqualTo(2);
  }

  //  {userTypes : ["worker", "director"],
  //  organizations : ["Broad Street Ministry"]}
  @Test
  public void queryOneOrgsTest() {
    JSONObject body = new JSONObject();
    JSONArray orgs = new JSONArray();
    JSONArray userTypes = new JSONArray();

    orgs.put("Broad Street Ministry");
    userTypes.put("worker");
    userTypes.put("director");
    body.put("userTypes", userTypes);
    body.put("organizations", orgs);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-usertype-count")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Success.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("SUCCESS");
    assert (resp.has("workers"));
    // assertThat(resp.getInt("workers")).isEqualTo(6);
    assert (resp.has("directors"));
    // assertThat(resp.getInt("directors")).isEqualTo(1);
  }

  //  {userTypes : ["worker", "director"],
  //  organizations : ["Broad Street Ministry", "YMCA"]}
  @Test
  public void queryTwoOrgsTest() {
    JSONObject body = new JSONObject();
    JSONArray orgs = new JSONArray();
    JSONArray userTypes = new JSONArray();

    orgs.put("Broad Street Ministry");
    orgs.put("YMCA");
    userTypes.put("worker");
    userTypes.put("director");
    body.put("userTypes", userTypes);
    body.put("organizations", orgs);

    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-usertype-count")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .body(body.toString())
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

    assert (resp.has("message"));
    assertThat(resp.getString("message")).isEqualTo("Success.");
    assert (resp.has("status"));
    assertThat(resp.getString("status")).isEqualTo("SUCCESS");
    assert (resp.has("workers"));
    // assertThat(resp.getInt("workers")).isEqualTo(12);
    assert (resp.has("directors"));
    // assertThat(resp.getInt("directors")).isEqualTo(2);
  }

  @Test
  public void findAllOrgs() throws ValidationException {
    HttpResponse actualResponse =
        Unirest.post(TestUtils.getServerUrl() + "/get-all-orgs")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .asString();

    JSONObject resp = TestUtils.responseStringToJSON(actualResponse.getBody().toString());

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
