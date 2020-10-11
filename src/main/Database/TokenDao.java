package Database;

import static com.mongodb.client.model.Filters.eq;

import Security.Tokens;
import Security.Tokens.TokenType;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class TokenDao {
  public static Tokens getTokensOrNull(MongoDatabase db, String username) {
    MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
    return tokenCollection.find(eq("username", username)).first();
  }

  public static void removeTokenIfLast(
      MongoDatabase db, String username, Tokens tokens, TokenType tokenType) {
    // Remove the token entry if its last remaining key is the password-reset-token.
    // Remove only the password reset token if there are other fields.
    MongoCollection<Tokens> tokenCollection = db.getCollection("tokens", Tokens.class);
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
}
