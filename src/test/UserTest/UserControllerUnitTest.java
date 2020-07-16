package UserTest;

import User.User;
import User.UserType;
import Validation.ValidationException;
import org.json.JSONObject;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class UserControllerUnitTest {

  @Test
  public void nullFirstNameForUserThrowsExceptionTest() {
    ValidationException ve =
        assertThrows(
            ValidationException.class,
            () -> {
              User user =
                  new User(
                      null,
                      "Lastname",
                      "12/14/1997",
                      "email@email.com",
                      "1234567890",
                      "Broad Street Ministry",
                      "311 Broad Street",
                      "Philadelphia",
                      "PA",
                      "19104",
                      true,
                      "username",
                      "password",
                      UserType.Director);
            });

    JSONObject expectedJSON =
        new JSONObject().put("message", "Invalid First Name").put("status", "INVALID_PARAMETER");
    JSONObject actualJSON = ve.getJSON();

    assertEquals(expectedJSON.getString("message"), actualJSON.getString("message"));
    assertEquals(expectedJSON.getString("status"), actualJSON.getString("status"));
  }

  @Test
  public void emptyStringFirstNameThrowsExceptionTest() {
    ValidationException ve =
        assertThrows(
            ValidationException.class,
            () -> {
              User user =
                  new User(
                      "",
                      "Lastname",
                      "12/14/1997",
                      "email@email.com",
                      "1234567890",
                      "Broad Street Ministry",
                      "311 Broad Street",
                      "Philadelphia",
                      "PA",
                      "19104",
                      true,
                      "username",
                      "password",
                      UserType.Director);
            });

    JSONObject expectedJSON =
        new JSONObject().put("message", "Invalid First Name").put("status", "INVALID_PARAMETER");
    JSONObject actualJSON = ve.getJSON();

    assertEquals(expectedJSON.getString("message"), actualJSON.getString("message"));
    assertEquals(expectedJSON.getString("status"), actualJSON.getString("status"));
  }
}