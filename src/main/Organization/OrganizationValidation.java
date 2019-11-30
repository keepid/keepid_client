package Organization;

import io.javalin.http.Context;
import java.io.IOException;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

public class OrganizationValidation {

    protected static boolean isValidOrg(HttpServletRequest req, Context ctx)
        throws SecurityException, IOException {
        String orgName = req.getParameter("orgName");
        String orgWebsite = req.getParameter("orgWebsite");
        String adminName = req.getParameter("name");
        String orgContactPhoneNumber = req.getParameter("phone");
        String email = req.getParameter("email");
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String address = req.getParameter("address").toLowerCase();
        String city = req.getParameter("city").toLowerCase();
        String state = req.getParameter("state").toUpperCase();
        String zipcode = req.getParameter("zipcode");
        String taxCode = req.getParameter("taxCode");
        String numUsers = req.getParameter("numUsers");
        Map<String, String[]> paramMap = req.getParameterMap();
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
