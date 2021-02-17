package DatabaseTest.Organization;

import Config.DeploymentLevel;
import Database.Organization.OrgDao;
import Database.Organization.OrgDaoFactory;
import Organization.Organization;
import TestUtils.EntityFactory;
import TestUtils.TestUtils;
import com.google.common.collect.ImmutableList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class OrgDaoImplUnitTests {
  public OrgDao orgDao;

  @Before
  public void initialize() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    this.orgDao = OrgDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void reset() {
    orgDao.clear();
  }

  @Test
  public void save() {
    String testOrgName = "org1";
    Organization organization = EntityFactory.createOrganization().withOrgName(testOrgName).build();
    orgDao.save(organization);
    assertTrue(orgDao.get(testOrgName).isPresent());
    assertEquals(orgDao.get(testOrgName).get(), organization);
  }

  @Test
  public void get() {
    String testOrgName = "org1";
    Organization organization =
        EntityFactory.createOrganization().withOrgName(testOrgName).buildAndPersist(orgDao);
    assertTrue(orgDao.get(testOrgName).isPresent());
    assertEquals(orgDao.get(testOrgName).get(), organization);
  }

  @Test
  public void deleteByUsername() {
    String testOrgName = "org1";
    EntityFactory.createOrganization().withOrgName(testOrgName).buildAndPersist(orgDao);
    assertTrue(orgDao.get(testOrgName).isPresent());
    orgDao.delete(testOrgName);
    assertFalse(orgDao.get(testOrgName).isPresent());
  }

  @Test
  public void size() {
    orgDao.clear();
    EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(3, orgDao.size());
  }

  @Test
  public void clear() {
    orgDao.clear();
    EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(3, orgDao.size());
    orgDao.clear();
    assertEquals(0, orgDao.size());
  }

  @Test
  public void getAll() {
    orgDao.clear();
    Organization org1 =
        EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    Organization org2 =
        EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    Organization org3 =
        EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(ImmutableList.of(org1, org2, org3), orgDao.getAll());
  }
}
