package Database.Token;

import Database.Dao;
import Security.Tokens;

import java.util.Optional;

public interface TokenDao extends Dao<Tokens> {

  Optional<Tokens> get(String username);

  void delete(String username);

  void removeTokenIfLast(String username, Tokens tokens, Tokens.TokenType tokenType);

  void replaceOne(String username, Tokens token);
}
