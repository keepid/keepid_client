package Security;

import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.security.SecureRandom;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.Objects;
import org.apache.commons.lang3.RandomStringUtils;

/*
   Methods for handling JSON Web Tokens (JWTs)
*/
public class SecurityUtils {
  private static final int ID_LENGTH = 25;
  private static final int ID_START_CHARACTERS = 48;
  private static final int ID_END_CHARACTERS = 122;
  private static final boolean INCLUDE_LETTERS = true;
  private static final boolean INCLUDE_NUMBERS = true;
  private static final char[] ID_CHARACTERS = null;


  public enum PassHashEnum {
    SUCCESS,
    FAILURE,
    ERROR;
  }

  public static String generateRandomStringId() {
    return RandomStringUtils.random(ID_LENGTH, ID_START_CHARACTERS, ID_END_CHARACTERS,
        INCLUDE_LETTERS, INCLUDE_NUMBERS, ID_CHARACTERS, new SecureRandom());
  }

  // JWT Creation Method for password reset
  public static String createJWT(String id, String issuer, String user, String subject, long ttlMillis) {

    String SECRET_KEY = Objects.requireNonNull(System.getenv("PASSWORD_RESET_KEY"));

    // JWT signature algorithm to sign the token
    SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

    long nowMillis = System.currentTimeMillis();
    Date now = new Date(nowMillis);

    // JWT signed with ApiKey secret
    byte[] apiKeySecretBytes = DatatypeConverter.parseBase64Binary(SECRET_KEY);
    Key signingKey = new SecretKeySpec(apiKeySecretBytes, signatureAlgorithm.getJcaName());

    // JWT Claims
    JwtBuilder builder =
        Jwts.builder()
            .setId(id)
            .setIssuedAt(now)
            .setSubject(subject)
            .setAudience(user)
            .setIssuer(issuer)
            .signWith(signatureAlgorithm, signingKey);

    // Set the Expiration
    if (ttlMillis >= 0) {
      long expMillis = nowMillis + ttlMillis;
      Date exp = new Date(expMillis);
      builder.setExpiration(exp);
    }

    // Build the JWT and serialize it to a URL-safe string
    return builder.compact();
  }

  // JWT Creation Method for non-existing users (Organization invite users)
  public static String createOrgJWT(
      String id,
      String issuer,
      String firstName,
      String lastName,
      String role,
      String subject,
      String org,
      long ttlMillis)
      throws IOException {
    // Using the PASSWORD_RESET_KEY for now
    String SECRET_KEY = Objects.requireNonNull(System.getenv("PASSWORD_RESET_KEY"));

    // JWT signature algorithm to sign the token
    SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

    long nowMillis = System.currentTimeMillis();
    Date now = new Date(nowMillis);

    // JWT signed with ApiKey secret
    byte[] apiKeySecretBytes = DatatypeConverter.parseBase64Binary(SECRET_KEY);
    Key signingKey = new SecretKeySpec(apiKeySecretBytes, signatureAlgorithm.getJcaName());

    // JWT Claims
    JwtBuilder builder =
        Jwts.builder()
            .setId(id)
            .setIssuedAt(now)
            .setSubject(subject)
            .setIssuer(issuer)
            .claim("firstName", firstName)
            .claim("lastName", lastName)
            .claim("role", role)
            .claim("organization", org)
            .signWith(signatureAlgorithm, signingKey);

    // Set the Expiration
    if (ttlMillis >= 0) {
      long expMillis = nowMillis + ttlMillis;
      Date exp = new Date(expMillis);
      builder.setExpiration(exp);
    }

    // Build the JWT and serialize it to a URL-safe string
    return builder.compact();
  }

  public static Claims decodeJWT(String jwt) throws IOException {
    String SECRET_KEY = Objects.requireNonNull(System.getenv("PASSWORD_RESET_KEY"));

    // This line will throw an exception if it is not a signed JWS (as expected)
    Claims claims =
        Jwts.parser()
            .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
            .parseClaimsJws(jwt)
            .getBody();
    return claims;
  }

  // Tests testPass against realPassHash, the hash of the real password.
  public static PassHashEnum verifyPassword(String testPass, String realPassHash) {
    Argon2 argon2 = Argon2Factory.create();
    char[] passwordArr = testPass.toCharArray();
    try {
      if (argon2.verify(realPassHash, passwordArr)) { // Hash matches password
        argon2.wipeArray(passwordArr);
        return PassHashEnum.SUCCESS;
      } else {
        argon2.wipeArray(passwordArr);
        return PassHashEnum.FAILURE;
      }
    } catch (Exception e) {
      e.printStackTrace();
      argon2.wipeArray(passwordArr);
      return PassHashEnum.ERROR;
    }
  }

  // Hashes a password using Argon2.
  // Returns hashed password, or null if Argon2 fails.
  public static String hashPassword(String plainText) {
    Argon2 argon2 = Argon2Factory.create();
    char[] passwordArr = plainText.toCharArray();
    String passwordHash;
    try {
      passwordHash = argon2.hash(10, 65536, 1, passwordArr);
      argon2.wipeArray(passwordArr);
      return passwordHash;
    } catch (Exception e) {
      argon2.wipeArray(passwordArr);
      return null;
    }
  }
}
