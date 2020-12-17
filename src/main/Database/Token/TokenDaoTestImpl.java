package Database.Token;

import Config.DeploymentLevel;
import Security.Tokens;
import org.bson.types.ObjectId;

import java.util.*;

public class TokenDaoTestImpl implements TokenDao {
  Map<String, Tokens> tokenMap;

  public TokenDaoTestImpl(DeploymentLevel deploymentLevel) {
    if (deploymentLevel != DeploymentLevel.IN_MEMORY) {
      throw new IllegalStateException(
          "Should not run in memory test database in production or staging");
    }
    tokenMap = new LinkedHashMap<>();
  }

  @Override
  public Optional<Tokens> get(String username) {
    return Optional.ofNullable(tokenMap.get(username));
  }

  @Override
  public void delete(String username) {
    tokenMap.remove(username);
  }

  @Override
  public Optional<Tokens> get(ObjectId id) {
    for (Tokens token : tokenMap.values()) {
      if (token.getId().equals(id)) {
        return Optional.of(token);
      }
    }
    return Optional.empty();
  }

  @Override
  public List<Tokens> getAll() {
    return new ArrayList<Tokens>(tokenMap.values());
  }

  @Override
  public int size() {
    return tokenMap.size();
  }

  @Override
  public void delete(Tokens token) {
    tokenMap.remove(token.getUsername());
  }

  @Override
  public void clear() {
    tokenMap.clear();
  }

  @Override
  public void update(Tokens token) {
    tokenMap.put(token.getUsername(), token);
  }

  @Override
  public void save(Tokens token) {
    tokenMap.put(token.getUsername(), token);
  }

  @Override
  public void removeTokenIfLast(String username, Tokens tokens, Tokens.TokenType tokenType) {
    if (tokens.numTokens() == 1) {
      delete(tokens);
    } else {
      switch (tokenType) {
        case PASSWORD_RESET:
          replaceOne(username, tokens.setResetJwt(null));
          break;
        case TWO_FACTOR:
          replaceOne(username, tokens.setTwoFactorCode(null).setTwoFactorExp(null));
          break;
        default:
          // do nothing
      }
    }
  }

  @Override
  public void replaceOne(String username, Tokens token) {
    Optional<Tokens> tokenResult = get(username);
    if (tokenResult.isPresent()) {
      tokenMap.put(username, token);
    }
  }
}
