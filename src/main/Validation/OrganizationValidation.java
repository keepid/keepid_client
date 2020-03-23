package Validation;

import Logger.LogFactory;
import Organization.OrgEnrollmentStatus;
import io.javalin.http.Context;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.IOException;

public class OrganizationValidation implements GeneralValidator {

  public static boolean isValid(
      String orgName,
      String orgWebsite,
      String orgEIN,
      String orgStreetAddress,
      String orgCity,
      String orgState,
      String orgZipcode,
      String orgEmail,
      String orgPhoneNumber,
      Context ctx)
      throws SecurityException, IOException {

    JSONObject errorJSON = new JSONObject();
    // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("OrganizationValidation");

    if (!ValidationUtils.isValidOrgName(orgName)) {
      logger.error("Invalid orgname: " + orgName);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Name");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
      logger.error("Invalid website: " + orgWebsite);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Website");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidEIN(orgEIN)) {
      logger.error("Invalid taxCode: " + orgEIN);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization EIN");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(orgPhoneNumber)) {
      logger.error("Invalid orgContactPhoneNumber: " + orgPhoneNumber);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Phone");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidEmail(orgEmail)) {
      logger.error("Invalid email: " + orgEmail);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Email");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidAddress(orgStreetAddress)) {
      logger.error("Invalid address: " + orgStreetAddress);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Street");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidCity(orgCity)) {
      logger.error("Invalid city: " + orgCity);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization City");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidUSState(orgState)) {
      logger.error("Invalid state: " + orgState);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization State");
      ctx.json(errorJSON.toString());
      return false;
    }
    if (!ValidationUtils.isValidZipCode(orgZipcode)) {
      logger.error("Invalid zipcode: " + orgZipcode);
      errorJSON.put("status", OrgEnrollmentStatus.INVALID_PARAMETER.toString());
      errorJSON.put("message", "Invalid Organization Zipcode");
      ctx.json(errorJSON.toString());
      return false;
    }
    return true;
  }
}
