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
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Name"));
      return false;
    }
    if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
      logger.error("Invalid website: " + orgWebsite);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Website"));
      return false;
    }
    if (!ValidationUtils.isValidEIN(orgEIN)) {
      logger.error("Invalid taxCode: " + orgEIN);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization EIN"));
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(orgPhoneNumber)) {
      logger.error("Invalid orgContactPhoneNumber: " + orgPhoneNumber);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Phone"));
      return false;
    }
    if (!ValidationUtils.isValidEmail(orgEmail)) {
      logger.error("Invalid email: " + orgEmail);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Email"));
      return false;
    }
    if (!ValidationUtils.isValidAddress(orgStreetAddress)) {
      logger.error("Invalid address: " + orgStreetAddress);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Street"));
      return false;
    }
    if (!ValidationUtils.isValidCity(orgCity)) {
      logger.error("Invalid city: " + orgCity);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization City"));
      return false;
    }
    if (!ValidationUtils.isValidUSState(orgState)) {
      logger.error("Invalid state: " + orgState);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization State"));
      return false;
    }
    if (!ValidationUtils.isValidZipCode(orgZipcode)) {
      logger.error("Invalid zipcode: " + orgZipcode);
      ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Zipcode"));
      return false;
    }
    return true;
  }
}
