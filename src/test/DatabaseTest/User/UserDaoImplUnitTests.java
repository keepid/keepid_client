package DatabaseTest.User;

import Config.DeploymentLevel;
import Database.User.UserDao;
import Database.User.UserDaoFactory;
import TestUtils.EntityFactory;
import User.User;
import com.google.common.collect.ImmutableList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class UserDaoImplUnitTests {
  public UserDao userDao;

  @Before
  public void initialize() {
    this.userDao = UserDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void reset() {
    userDao.clear();
  }

  @Test
  public void save() {
    String testUsername = "username1";
    User user = EntityFactory.createUser().withUsername(testUsername).build();
    userDao.save(user);
    assertTrue(userDao.get(testUsername).isPresent());
    assertEquals(userDao.get(testUsername).get(), user);
  }

  @Test
  public void get() {
    String testUsername = "username1";
    User user = EntityFactory.createUser().withUsername(testUsername).buildAndPersist(userDao);
    assertTrue(userDao.get(testUsername).isPresent());
    assertEquals(userDao.get(testUsername).get(), user);
  }

  @Test
  public void deleteByUsername() {
    String testUsername = "username1";
    EntityFactory.createUser().withUsername(testUsername).buildAndPersist(userDao);
    assertTrue(userDao.get(testUsername).isPresent());
    userDao.delete(testUsername);
    assertFalse(userDao.get(testUsername).isPresent());
  }

  @Test
  public void size() {
    EntityFactory.createUser().withUsername("username1").buildAndPersist(userDao);
    EntityFactory.createUser().withUsername("username2").buildAndPersist(userDao);
    EntityFactory.createUser().withUsername("username3").buildAndPersist(userDao);
    assertEquals(3, userDao.size());
  }

  @Test
  public void clear() {
    EntityFactory.createUser().withUsername("username1").buildAndPersist(userDao);
    EntityFactory.createUser().withUsername("username2").buildAndPersist(userDao);
    EntityFactory.createUser().withUsername("username3").buildAndPersist(userDao);
    assertEquals(3, userDao.size());
    userDao.clear();
    assertEquals(0, userDao.size());
  }

  @Test
  public void getAll() {
    User user1 = EntityFactory.createUser().withUsername("username1").buildAndPersist(userDao);
    User user2 = EntityFactory.createUser().withUsername("username2").buildAndPersist(userDao);
    User user3 = EntityFactory.createUser().withUsername("username3").buildAndPersist(userDao);
    assertEquals(ImmutableList.of(user1, user2, user3), userDao.getAll());
  }
}
