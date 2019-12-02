package Organization;

import Logger.LogFactory;
import Security.GeneralValidator;
import Security.ValidationUtils;
import io.javalin.http.Context;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;

public class OrganizationValidation implements GeneralValidator {

    protected static boolean isValid(HttpServletRequest req, Context ctx)
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

        // declare logger here
        LogFactory l = new LogFactory();
        Logger logger = l.createLogger();

        if (!ValidationUtils.isValidOrgName(orgName)) {
            logger.error("Invalid or null orgname: " + orgName);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
            logger.error("Invalid or null website: " + orgWebsite);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidFirstName(adminName)) {
            logger.error("Invalid or null adminName: " + adminName);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidPhoneNumber(orgContactPhoneNumber)) {
            logger.error("Invalid or null orgContactPhoneNumber: " + orgContactPhoneNumber);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidEmail(email)) {
            logger.error("Invalid or null email: " + email);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidAddress(address)) {
            logger.error("Invalid or null address: " + address);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidCity(city)) {
            logger.error("Invalid or null city: " + city);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidUSState(state)) {
            logger.error("Invalid or null state: " + state);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidZipCode(zipcode)) {
            logger.error("Invalid or null zipcode: " + zipcode);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidTaxCode(taxCode)) {
            logger.error("Invalid or null taxCode: " + taxCode);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        if (!ValidationUtils.isValidNumUsers(numUsers)) {
            logger.error("Invalid or null numUsers: " + numUsers);
            ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
            return false;
        }
        return true;
    }
}
