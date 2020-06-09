package Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.Objects;

/*
   Methods for handling JSON Web Tokens (JWTs)
*/
public class SecurityUtils {

  // JWT Creation Method
  public static String createJWT(
      String id, String issuer, String user, String subject, long ttlMillis) throws IOException {

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
}
