package DatabaseTest.Token;

import Config.DeploymentLevel;
import Database.Token.TokenDao;
import Database.Token.TokenDaoFactory;
import Security.Tokens;
import TestUtils.EntityFactory;
import com.google.common.collect.ImmutableList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class TokenDaoImplUnitTests {
  public TokenDao tokenDao;

  @Before
  public void initialize() {
    this.tokenDao = TokenDaoFactory.create(DeploymentLevel.TEST);
  }

  @After
  public void reset() {
    tokenDao.clear();
  }

  @Test
  public void save() {
    String testUsername = "username1";
    Tokens token = EntityFactory.createTokens().withUsername(testUsername).build();
    tokenDao.save(token);
    assertTrue(tokenDao.get(testUsername).isPresent());
    assertEquals(tokenDao.get(testUsername).get(), token);
  }

  @Test
  public void get() {
    String testUsername = "username1";
    Tokens token =
        EntityFactory.createTokens().withUsername(testUsername).buildAndPersist(tokenDao);
    assertTrue(tokenDao.get(testUsername).isPresent());
    assertEquals(tokenDao.get(testUsername).get(), token);
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
    Tokens token1 =
        EntityFactory.createTokens().withUsername("username1").buildAndPersist(tokenDao);
    Tokens token2 =
        EntityFactory.createTokens().withUsername("username2").buildAndPersist(tokenDao);
    Tokens token3 =
        EntityFactory.createTokens().withUsername("username3").buildAndPersist(tokenDao);
    assertEquals(ImmutableList.of(token1, token2, token3), tokenDao.getAll());
  }
}
