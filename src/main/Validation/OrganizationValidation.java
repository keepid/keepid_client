package Validation;

import Logger.LogFactory;
import Organization.OrgEnrollmentStatus;
import Organization.Organization;
import org.slf4j.Logger;

import java.io.IOException;

public class OrganizationValidation {

  public static boolean isValid(Organization org) throws SecurityException, IOException {
    // declare logger here
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("OrganizationValidation");

    if (!ValidationUtils.isValidOrgName(org.orgName)) {
      logger.error("Invalid orgname: " + org.orgName);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Name"));
      return false;
    }
    if (!ValidationUtils.isValidOrgWebsite(org.orgWebsite)) {
      logger.error("Invalid website: " + org.orgWebsite);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Website"));
      return false;
    }
    if (!ValidationUtils.isValidEIN(org.orgEIN)) {
      logger.error("Invalid taxCode: " + org.orgEIN);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization EIN"));
      return false;
    }
    if (!ValidationUtils.isValidPhoneNumber(org.orgPhoneNumber)) {
      logger.error("Invalid orgContactPhoneNumber: " + org.orgPhoneNumber);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Phone"));
      return false;
    }
    if (!ValidationUtils.isValidEmail(org.orgEmail)) {
      logger.error("Invalid email: " + org.orgEmail);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Email"));
      return false;
    }
    if (!ValidationUtils.isValidAddress(org.orgStreetAddress)) {
      logger.error("Invalid address: " + org.orgStreetAddress);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Street"));
      return false;
    }
    if (!ValidationUtils.isValidCity(org.orgCity)) {
      logger.error("Invalid city: " + org.orgCity);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization City"));
      return false;
    }
    if (!ValidationUtils.isValidUSState(org.orgState)) {
      logger.error("Invalid state: " + org.orgState);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization State"));
      return false;
    }
    if (!ValidationUtils.isValidZipCode(org.orgZipcode)) {
      logger.error("Invalid zipcode: " + org.orgZipcode);
      org.ctx.json(OrgEnrollmentStatus.INVALID_PARAMETER.toJSON("Invalid Organization Zipcode"));
      return false;
    }
    return true;
  }
}
