package Validation;

import Logger.LogFactory;
import Organization.OrgEnrollmentStatus;
import io.javalin.http.Context;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.IOException;

public class OrganizationValidation implements GeneralValidator {

  public static boolean isValid(JSONObject req, Context ctx) throws SecurityException, IOException {
    String orgName = req.getString("organizationName");
    String orgWebsite = req.getString("organizationWebsite").toLowerCase();
    String orgTaxCode = req.getString("organizationEIN");
    String orgAddress = req.getString("organizationAddressStreet").toUpperCase();
    String orgCity = req.getString("organizationAddressCity").toUpperCase();
    String orgState = req.getString("organizationAddressState").toUpperCase();
    String orgZipcode = req.getString("organizationAddressZipcode");
    String orgEmail = req.getString("organizationEmail");
    String orgPhoneNumber = req.getString("organizationPhoneNumber");

    String firstName = req.getString("personFirstName").toUpperCase();
    String lastName = req.getString("personLastName").toUpperCase();
    String birthDate = req.getString("personBirthDate");
    String email = req.getString("personEmail").toLowerCase();
    String phone = req.getString("personPhoneNumber");
    String address = req.getString("personAddressStreet").toUpperCase();
    String city = req.getString("personAddressCity").toUpperCase();
    String state = req.getString("personAddressState").toUpperCase();
    String zipcode = req.getString("personAddressZipcode");
    String username = req.getString("personUsername");
    String password = req.getString("personPassword");

    // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("OrganizationValidation");

    if (!ValidationUtils.isValidOrgName(orgName)) {
      logger.error("Invalid or null orgname: " + orgName);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
      logger.error("Invalid or null website: " + orgWebsite);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidFirstName(firstName)) {
      logger.error("Invalid or null firstName: " + firstName);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      logger.error("Invalid or null lastName: " + lastName);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(phone)) {
      logger.error("Invalid or null orgContactPhoneNumber: " + phone);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidEmail(email)) {
      logger.error("Invalid or null email: " + email);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidAddress(address)) {
      logger.error("Invalid or null address: " + address);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidCity(city)) {
      logger.error("Invalid or null city: " + city);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidUSState(state)) {
      logger.error("Invalid or null state: " + state);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidZipCode(zipcode)) {
      logger.error("Invalid or null zipcode: " + zipcode);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    if (!ValidationUtils.isValidTaxCode(orgTaxCode)) {
      logger.error("Invalid or null taxCode: " + orgTaxCode);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      return false;
    }
    return true;
  }
}
