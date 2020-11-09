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
    File examplePDF = new File(currentPfpFolderPath + File.separator + "first-love.png");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    JSONObject uploadResponseJSON = TestUtils.responseStringToJSON(uploadResponse.getBody());
    assertThat(uploadResponseJSON.getString("status")).isEqualTo("SUCCESS");
    HttpResponse<byte[]> get = Unirest.post(TestUtils.getServerUrl() + "/load-pfp").asBytes();
    assert (get.isSuccess());
  }

  public static void getPfp() {
    File examplePDF = new File(currentPfpFolderPath + File.separator + "mvc.png");
    HttpResponse<String> uploadResponse =
        Unirest.post(TestUtils.getServerUrl() + "/upload-pfp")
            .header("Content-Disposition", "attachment")
            .field("file", examplePDF)
            .asString();
    HttpResponse<byte[]> get = Unirest.post(TestUtils.getServerUrl() + "/load-pfp").asBytes();
    assert (get.isSuccess());
  }
}
