package Database.Token;

import Config.DeploymentLevel;
import Config.MongoConfig;
import Security.Tokens;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.ReplaceOptions;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.mongodb.client.model.Filters.eq;

public class TokenDaoImpl implements TokenDao {
  private MongoCollection<Tokens> tokenCollection;

  public TokenDaoImpl(DeploymentLevel deploymentLevel) {
    MongoDatabase db = MongoConfig.getDatabase(deploymentLevel);
    if (db == null) {
      throw new IllegalStateException("DB cannot be null");
    }
    tokenCollection = db.getCollection("tokens", Tokens.class);
  }

  @Override
  public Optional<Tokens> get(String username) {
    return Optional.ofNullable(tokenCollection.find(eq("username", username)).first());
  }

  @Override
  public Optional<Tokens> get(ObjectId id) {
    return Optional.ofNullable(tokenCollection.find(eq("_id", id)).first());
  }

  @Override
  public List<Tokens> getAll() {
    return tokenCollection.find().into(new ArrayList<>());
  }

  @Override
  public int size() {
    return (int) tokenCollection.countDocuments();
  }

  @Override
  public void delete(Tokens tokens) {
    tokenCollection.deleteOne(eq("username", tokens.getUsername()));
  }

  @Override
  public void clear() {
    tokenCollection.drop();
  }

  @Override
  public void delete(String username) {
    tokenCollection.deleteOne(eq("username", username));
  }

  @Override
  public void update(Tokens token) {
    tokenCollection.replaceOne(eq("username", token.getUsername()), token);
  }

  @Override
  public void save(Tokens tokens) {
    tokenCollection.insertOne(tokens);
  }

  @Override
  public void removeTokenIfLast(String username, Tokens tokens, Tokens.TokenType tokenType) {
    // Remove the token entry if its last remaining key is the password-reset-token.
    // Remove only the password reset token if there are other fields.
    if (tokens.numTokens() == 1) {
      tokenCollection.deleteOne(eq("username", username));
    } else {
      switch (tokenType) {
        case PASSWORD_RESET:
          tokenCollection.replaceOne(eq("username", username), tokens.setResetJwt(null));
          break;
        case TWO_FACTOR:
          tokenCollection.replaceOne(
              eq("username", username), tokens.setTwoFactorCode(null).setTwoFactorExp(null));
          break;
        default:
          // do nothing here
      }
    }
  }

  @Override
  public void replaceOne(String username, Tokens token) {
    Optional<Tokens> oldToken = get(username);
    tokenCollection.replaceOne(eq("username", username), token, new ReplaceOptions().upsert(true));
  }
}
