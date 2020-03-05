package OrganizationIntTests;

import Logger.LogFactory;
import Security.GeneralValidator;
import Security.ValidationUtils;
import io.javalin.http.Context;
import java.io.IOException;
import org.json.JSONObject;
import org.slf4j.Logger;

public class OrganizationValidation implements GeneralValidator {

  protected static boolean isValid(JSONObject req, Context ctx)
      throws SecurityException, IOException {
    String orgName = req.getString("orgName");
    String orgWebsite = req.getString("orgWebsite").toLowerCase();
    String firstName = req.getString("firstName").toLowerCase();
    String lastName = req.getString("lastName").toLowerCase();
    String orgContactPhoneNumber = req.getString("phone").toLowerCase();
    String email = req.getString("email").toLowerCase();
    String username = req.getString("username");
    String password = req.getString("password");
    String address = req.getString("address").toLowerCase();
    String city = req.getString("city").toLowerCase();
    String state = req.getString("state").toUpperCase();
    String zipcode = req.getString("zipcode");
    String taxCode = req.getString("taxCode");

    // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("OrganizationValidation");

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
    if (!ValidationUtils.isValidFirstName(firstName)) {
      logger.error("Invalid or null firstName: " + firstName);
      ctx.result(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      logger.error("Invalid or null lastName: " + lastName);
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
    return true;
  }
}
