package UserTest;

import User.User;
import User.UserType;
import Validation.ValidationException;
import org.json.JSONObject;
import org.junit.Test;

import java.util.Calendar;
import java.util.Date;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

  // Checking to see if creationDate is within a 1 second window of actual creation.
  @Test
  public void checkCreationDate() throws ValidationException {
    User user =
        new User(
            "Firstname",
            "Lastname",
            "12-14-1997",
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

    Date currDate = new Date();
    Calendar cal = Calendar.getInstance();
    cal.setTime(currDate);

    // Creating an upperbound of 1 sec past the current system time to check against user
    // creationDate
    cal.add(Calendar.SECOND, 1);
    Date upperBound = cal.getTime();

    Date creationDate = user.getCreationDate();

    assertTrue(creationDate.before(upperBound));
  }
}
