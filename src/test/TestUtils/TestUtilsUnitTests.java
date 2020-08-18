package TestUtils;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Organization.Organization;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.junit.Test;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

public class TestUtilsUnitTests {

  @Test
  public void setUpTest() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    MongoDatabase testDB = MongoConfig.getDatabase(DeploymentLevel.TEST);
    MongoCollection<Organization> orgCollection =
        testDB.getCollection("organization", Organization.class);
    assertEquals(
        "311 Broad Street",
        Objects.requireNonNull(
                orgCollection.find(Filters.eq("orgName", "Broad Street Ministry")).first())
            .getOrgStreetAddress());
  }

  @Test
  public void tearDownTest() {
    TestUtils.tearDownTestDB();
    TestUtils.stopServer();
  }
}
