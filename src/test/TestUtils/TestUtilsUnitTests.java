package TestUtils;

import Config.MongoConfig;
import Organization.Organization;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.junit.Test;
import resources.TestUtils;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

public class TestUtilsUnitTests {

  @Test
  public void setUpTest() {
    try {
      TestUtils.setUpTestDB();
      MongoDatabase testDB =
          MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
      MongoCollection<Organization> orgCollection =
          testDB.getCollection("organization", Organization.class);
      assertEquals(
          "311 Broad Street",
          Objects.requireNonNull(
                  orgCollection.find(Filters.eq("orgName", "Broad Street Ministry")).first())
              .getOrgStreetAddress());
    } catch (Exception e) {
      fail(e);
    }
  }

  @Test
  public void tearDownTest() {
    //    TestUtils.tearDownTestDB();
  }
}
