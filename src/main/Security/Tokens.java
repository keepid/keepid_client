package Security;

import java.util.Date;
import java.util.Objects;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

public class Tokens {
  public enum TokenType {
    PASSWORD_RESET,
    TWO_FACTOR
  }

  private ObjectId id;

  @BsonProperty(value = "username")
  private String username;

  @BsonProperty(value = "password-reset-jwt")
  private String resetJwt;

  @BsonProperty(value = "2fa-code")
  private String twoFactorCode;

  @BsonProperty(value = "2fa-exp")
  private Date twoFactorExp;

  public Tokens() {}

  /** **************** GETTERS ********************* */
  public ObjectId getId() {
    return this.id;
  }

  public String getUsername() {
    return this.username;
  }

  public String getResetJwt() {
    return this.resetJwt;
  }

  public String getTwoFactorCode() {
    return this.twoFactorCode;
  }

  public Date getTwoFactorExp() {
    return this.twoFactorExp;
  }

  /** **************** SETTERS ********************* */
  public Tokens setId(ObjectId id) {
    this.id = id;
    return this;
  }

  public Tokens setUsername(String username) {
    this.username = username;
    return this;
  }

  public Tokens setResetJwt(String resetJwt) {
    this.resetJwt = resetJwt;
    return this;
  }

  public Tokens setTwoFactorCode(String twoFactorCode) {
    this.twoFactorCode = twoFactorCode;
    return this;
  }

  public Tokens setTwoFactorExp(Date twoFactorExp) {
    this.twoFactorExp = twoFactorExp;
    return this;
  }

  public int numTokens() {
    int numTokens = 0;

    if (this.resetJwt != null) numTokens++;
    if (this.twoFactorCode != null) numTokens++;

    return numTokens;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder("Tokens {");
    sb.append("id=").append(this.id);
    sb.append(", username=").append(this.username);
    sb.append(", resetJwt=").append(this.resetJwt);
    sb.append(", twoFactorCode=").append(this.twoFactorCode);
    sb.append(", twoFactorExp=").append(this.twoFactorExp.toString());
    sb.append("}");
    return sb.toString();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Tokens tok = (Tokens) o;
    return Objects.equals(this.id, tok.id)
        && Objects.equals(this.username, tok.username)
        && Objects.equals(this.resetJwt, tok.resetJwt)
        && Objects.equals(this.twoFactorCode, tok.twoFactorCode)
        && Objects.equals(this.twoFactorExp, tok.twoFactorExp);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        this.id, this.username, this.resetJwt, this.twoFactorCode, this.twoFactorExp);
  }
}
