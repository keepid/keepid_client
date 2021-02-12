package UserTest;

import Config.DeploymentLevel;
import Config.MongoConfig;
import TestUtils.TestUtils;
import com.mongodb.client.MongoDatabase;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;

public class PfpTestIntegration {
  private static String currentPfpFolderPath =
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

  MongoDatabase db = MongoConfig.getDatabase(DeploymentLevel.TEST);

  @Test
  public void uploadValidPDFTestExists() {
    TestUtils.login("createAdminOwner", "login-history-test");
    uploadTestPfp();
    getPfp();
    TestUtils.logout();
  }

  public static void uploadTestPfp() {
    File PDF1 = new File(currentPfpFolderPath + File.separator + "1.png");
    File PDF2 = new File(currentPfpFolderPath + File.separator + "2.png");
    File PDF3 = new File(currentPfpFolderPath + File.separator + "3.png");
    File PDF4 = new File(currentPfpFolderPath + File.separator + "4.png");
    HttpResponse<String> upload1 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF1)
            .asString();
    HttpResponse<String> upload2 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF2)
            .asString();
    HttpResponse<String> upload3 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF2)
            .asString();
    HttpResponse<String> upload4 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF1)
            .asString();
    HttpResponse<String> upload5 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF3)
            .asString();
    HttpResponse<String> upload6 =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", PDF4)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(upload6.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");
    HttpResponse get =
        Unirest.post(TestUtils.getServerUrl() + "/load-pfp")
            .body("{ \"username\": \"asdf\" }")
            .asString();
    assert (get.isSuccess());
  }

  public static void getPfp() {
    File examplePDF = new File(currentPfpFolderPath + File.separator + "mvc.png");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("username", "asdf")
            .field("fileName", "ASDF")
            .field("file", examplePDF)
            .asString();
    HttpResponse<byte[]> get =
        Unirest.post(TestUtils.getServerUrl() + "/load-pfp")
            .body("{ \"username\": \"asdf\" }")
            .asBytes();
    assert (get.isSuccess());
  }
}
