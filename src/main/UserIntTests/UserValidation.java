package UserIntTests;

import OrganizationIntTests.OrgEnrollmentStatus;
import Security.GeneralValidator;
import io.javalin.http.Context;
import java.io.IOException;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

public class UserValidation implements GeneralValidator {

  protected static boolean isValid(HttpServletRequest req, Context ctx)
      throws SecurityException, IOException {
    String firstName = req.getString("firstName");
    String lastName = req.getString("firstName");

    String email = req.getString("email");
    String username = req.getString("username");
    String password = req.getString("password");
    String address = req.getString("address").toLowerCase();
    String city = req.getString("city").toLowerCase();
    String state = req.getString("state").toUpperCase();
    String zipcode = req.getString("zipcode");
    String taxCode = req.getString("taxCode");
    String numUsers = req.getString("numUsers");
    Map<String, String[]> paramMap = req.getStringMap();
    // @jalbi debug log errors
    //        Log l = new Log();

    // Empty or Null Check here
    for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
      String value = entry.getValue()[0];
      if (value == null || value.strip().length() == 0) {
        //                l.logger.warning(entry.getKey() + " field empty or null");
        ctx.result(OrgEnrollmentStatus.FIELD_EMPTY.toString());
        return false;
      }
    }

    if (email.length() > 40) {
      //        	l.logger.warning("Email Is Too Long " + email.length());
      ctx.result(OrgEnrollmentStatus.EMAIL_LEN_OVER_40.toString());
      return false;
    }
    //        if (!Pattern.matches(ValRegex.email, email)) {
    ////        	l.logger.warning("Email Uses Invalid Characters");
    //        	ctx.result(OrgEnrollmentStatus.INVALID_CHARACTERS.toString());
    //        	return false;
    //        }
    //
    //        if (!Pattern.matches(ValRegex.org, orgName)) {
    ////            l.logger.warning("Organization Name Contains Invalid Characters");
    //            ctx.result(OrgEnrollmentStatus.INVALID_CHARACTERS.toString());
    //            return false;
    //        }
    return true;
  }
}
