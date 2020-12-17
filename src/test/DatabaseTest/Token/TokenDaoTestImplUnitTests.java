package DatabaseTest.Token;

import Config.DeploymentLevel;
import Database.Token.TokenDao;
import Database.Token.TokenDaoFactory;
import Logger.LogFactory;
import Security.Tokens;
import TestUtils.EntityFactory;
import com.google.common.collect.ImmutableList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;

import static org.junit.Assert.*;

public class TokenDaoTestImplUnitTests {
  public TokenDao tokenDao;
  public Logger logger;

  @Before
  public void initialize() {
    this.tokenDao = TokenDaoFactory.create(DeploymentLevel.IN_MEMORY);
    this.logger = new LogFactory().createLogger();
  }

  @After
  public void reset() {
    this.tokenDao.clear();
  }

  @Test
  public void save() {
    String testUsername = "username1";

    Tokens tokens = EntityFactory.createTokens().withUsername(testUsername).build();
    tokenDao.save(tokens);
    assertTrue(tokenDao.get(testUsername).isPresent());
    assertEquals(tokenDao.get(testUsername).get(), tokens);
  }

  @Test
  public void get() {
    String testUsername = "username1";
    Tokens tokens =
        EntityFactory.createTokens().withUsername(testUsername).buildAndPersist(tokenDao);
    assertTrue(tokenDao.get(testUsername).isPresent());
    assertEquals(tokenDao.get(testUsername).get(), tokens);
  }

  @Test
  public void deleteByUsername() {
    String testUsername = "username1";
    EntityFactory.createTokens().withUsername(testUsername).buildAndPersist(tokenDao);
    assertTrue(tokenDao.get(testUsername).isPresent());
    tokenDao.delete(testUsername);
    assertFalse(tokenDao.get(testUsername).isPresent());
  }

  @Test
  public void size() {
    EntityFactory.createTokens().withUsername("username1").buildAndPersist(tokenDao);
    EntityFactory.createTokens().withUsername("username2").buildAndPersist(tokenDao);
    EntityFactory.createTokens().withUsername("username3").buildAndPersist(tokenDao);
    assertEquals(3, tokenDao.size());
  }

  @Test
  public void clear() {
    EntityFactory.createTokens().withUsername("username1").buildAndPersist(tokenDao);
    EntityFactory.createTokens().withUsername("username2").buildAndPersist(tokenDao);
    EntityFactory.createTokens().withUsername("username3").buildAndPersist(tokenDao);
    assertEquals(3, tokenDao.size());
    tokenDao.clear();
    assertEquals(0, tokenDao.size());
  }

  @Test
  public void getAll() {
    Tokens user1 = EntityFactory.createTokens().withUsername("username1").buildAndPersist(tokenDao);
    Tokens user2 = EntityFactory.createTokens().withUsername("username2").buildAndPersist(tokenDao);
    Tokens user3 = EntityFactory.createTokens().withUsername("username3").buildAndPersist(tokenDao);
    assertEquals(ImmutableList.of(user1, user2, user3), tokenDao.getAll());
  }
}
