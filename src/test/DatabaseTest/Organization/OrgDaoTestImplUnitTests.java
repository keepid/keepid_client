package DatabaseTest.Organization;

import Config.DeploymentLevel;
import Database.Organization.OrgDao;
import Database.Organization.OrgDaoFactory;
import Organization.Organization;
import TestUtils.EntityFactory;
import com.google.common.collect.ImmutableList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class OrgDaoTestImplUnitTests {
  public OrgDao orgDao;

  @Before
  public void initialize() {
    this.orgDao = OrgDaoFactory.create(DeploymentLevel.IN_MEMORY);
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
    EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(3, orgDao.size());
  }

  @Test
  public void clear() {
    EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(3, orgDao.size());
    orgDao.clear();
    assertEquals(0, orgDao.size());
  }

  @Test
  public void getAll() {
    Organization org1 =
        EntityFactory.createOrganization().withOrgName("org1").buildAndPersist(orgDao);
    Organization org2 =
        EntityFactory.createOrganization().withOrgName("org2").buildAndPersist(orgDao);
    Organization org3 =
        EntityFactory.createOrganization().withOrgName("org3").buildAndPersist(orgDao);
    assertEquals(ImmutableList.of(org1, org2, org3), orgDao.getAll());
  }
}
