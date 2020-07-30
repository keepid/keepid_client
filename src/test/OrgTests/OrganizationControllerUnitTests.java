package OrgTests;

import Organization.Organization;
import Validation.ValidationException;
import org.junit.Test;

import java.util.Calendar;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class OrganizationControllerUnitTests {
  @Test
  public void checkCreationDateOrg() throws ValidationException {
    String orgName = "Example Org";
    String orgWebsite = "https://example.com";
    String orgEIN = "12-1234567";
    String orgStreetAddress = "Example Address";
    String orgCity = "Chicago";
    String orgState = "IL";
    String orgZipcode = "12345";
    String orgEmail = "email@email.com";
    String orgPhoneNumber = "1234567890";

    Organization org =
        new Organization(
            orgName,
            orgWebsite,
            orgEIN,
            orgStreetAddress,
            orgCity,
            orgState,
            orgZipcode,
            orgEmail,
            orgPhoneNumber);

    Date currDate = new Date();
    Calendar cal = Calendar.getInstance();
    cal.setTime(currDate);

    // Creating an upperbound of 1 sec past the current system time to check against user
    // creationDate
    cal.add(Calendar.SECOND, 1);
    Date upperBound = cal.getTime();

    Date creationDate = org.getCreationDate();

    assertTrue(creationDate.before(upperBound));
  }
}
