package DatabaseTest.Form;

import Config.DeploymentLevel;
import Database.Form.FormDao;
import Database.Form.FormDaoFactory;
import Form.Form;
import TestUtils.EntityFactory;
import TestUtils.TestUtils;
import org.bson.types.ObjectId;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class FormDaoImplUnitTests {
  public FormDao formDao;

  @Before
  public void initialize() {
    TestUtils.startServer();
    TestUtils.setUpTestDB();
    this.formDao = FormDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void reset() {
    formDao.clear();
  }

  @Test
  public void save() {
    String testUsername = "username1";
    Form form = EntityFactory.createForm().withUsername(testUsername).build();
    formDao.save(form);
    assertTrue(formDao.get(testUsername).isPresent());
    assertEquals(formDao.get(testUsername).get().getUsername(), form.getUsername());
    assertEquals(formDao.get(testUsername).get().getUploaderUsername(), form.getUploaderUsername());
    assertEquals(formDao.get(testUsername).get().getLastModifiedAt(), form.getLastModifiedAt());
    assertEquals(formDao.get(testUsername).get().getUploadedAt(), form.getUploadedAt());
    assertEquals(formDao.get(testUsername).get().getBody(), form.getBody());
    assertEquals(formDao.get(testUsername).get().getMetadata(), form.getMetadata());
    assertEquals(formDao.get(testUsername).get().getFormType(), form.getFormType());
  }

  @Test
  public void get() {
    String testUsername = "username1";
    Form form = EntityFactory.createForm().withUsername(testUsername).buildAndPersist(formDao);
    assertTrue(formDao.get(testUsername).isPresent());
    assertEquals(formDao.get(testUsername).get().getUsername(), form.getUsername());
    assertEquals(formDao.get(testUsername).get().getUploaderUsername(), form.getUploaderUsername());
    assertEquals(formDao.get(testUsername).get().getLastModifiedAt(), form.getLastModifiedAt());
    assertEquals(formDao.get(testUsername).get().getUploadedAt(), form.getUploadedAt());
    assertEquals(formDao.get(testUsername).get().getBody(), form.getBody());
    assertEquals(formDao.get(testUsername).get().getMetadata(), form.getMetadata());
    assertEquals(formDao.get(testUsername).get().getFormType(), form.getFormType());
  }

  @Test
  public void deleteById() {
    String testUsername = "username1";
    EntityFactory.createForm().withUsername(testUsername).buildAndPersist(formDao);
    assertTrue(formDao.get(testUsername).isPresent());
    ObjectId id = formDao.get(testUsername).get().getId();
    formDao.delete(id);
    assertFalse(formDao.get(testUsername).isPresent());
  }

  @Test
  public void clear() {
    EntityFactory.createForm().withUsername("username1").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username2").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username3").buildAndPersist(formDao);
    assertTrue(formDao.size() > 0);
    formDao.clear();
    assertEquals(0, formDao.size());
  }

  @Test
  public void getAll() {
    formDao.clear();
    EntityFactory.createForm().withUsername("username1").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username2").buildAndPersist(formDao);
    EntityFactory.createForm().withUsername("username3").buildAndPersist(formDao);
    assertEquals(3, formDao.getAll().size());
  }
}
