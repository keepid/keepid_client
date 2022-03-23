package DatabaseTest.Form;

import Config.DeploymentLevel;
import Database.Form.FormDao;
import Database.Form.FormDaoFactory;
import Form.Form;
import TestUtils.EntityFactory;
import com.google.common.collect.ImmutableList;
import org.bson.types.ObjectId;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class FormDaoTestImplUnitTests {
  public FormDao formDao;

  @Before
  public void initialize() {
    this.formDao = FormDaoFactory.create(DeploymentLevel.IN_MEMORY);
  }

  @After
  public void reset() {
    this.formDao.clear();
  }

  @Test
  public void save() {
    String testUsername = "username1";
    Form form = EntityFactory.createForm().withUsername(testUsername).build();
    formDao.save(form);
    assertTrue(formDao.get(testUsername).isPresent());
    assertEquals(formDao.get(testUsername).get(), form);
  }

  @Test
  public void get() {
    String testUsername = "username1";
    Form form = EntityFactory.createForm().withUsername(testUsername).buildAndPersist(formDao);
    assertTrue(formDao.get(testUsername).isPresent());
    assertEquals(formDao.get(testUsername).get(), form);
  }

  @Test
  public void deleteByUsername() {
    String testUsername = "username1";
    EntityFactory.createForm().withUsername(testUsername).buildAndPersist(formDao);
    assertTrue(formDao.get(testUsername).isPresent());
    ObjectId id = formDao.get(testUsername).get().getId();
    formDao.delete(id);
    assertFalse(formDao.get(testUsername).isPresent());
  }

  @Test
  public void size() {
    EntityFactory.createForm().withUsername("username1").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username2").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username3").buildAndPersist(formDao);
    assertEquals(3, formDao.size());
  }

  @Test
  public void clear() {
    EntityFactory.createForm().withUsername("username1").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username2").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username3").buildAndPersist(formDao);
    assertEquals(3, formDao.size());
    formDao.clear();
    assertEquals(0, formDao.size());
  }

  @Test
  public void getAll() {
    Form form1 = EntityFactory.createForm().withUsername("username1").buildAndPersist(formDao);
    Form form2 = EntityFactory.createForm().withUsername("username2").buildAndPersist(formDao);
    Form form3 = EntityFactory.createForm().withUsername("username3").buildAndPersist(formDao);
    assertEquals(ImmutableList.of(form1, form2, form3), formDao.getAll());
  }
}
