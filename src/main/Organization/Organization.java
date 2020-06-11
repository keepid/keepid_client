package Organization;

import Logger.LogFactory;
import Validation.ValidationException;
import Validation.ValidationUtils;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.slf4j.Logger;

import java.util.Objects;

public class Organization {
  private ObjectId id;

  @BsonProperty(value = "orgName")
  private String orgName;

  @BsonProperty(value = "website")
  private String orgWebsite;

  @BsonProperty(value = "ein")
  private String orgEIN;

  @BsonProperty(value = "address")
  private String orgStreetAddress;

  @BsonProperty(value = "city")
  private String orgCity;

  @BsonProperty(value = "state")
  private String orgState;

  @BsonProperty(value = "zipcode")
  private String orgZipcode;

  @BsonProperty(value = "email")
  private String orgEmail;

  @BsonProperty(value = "phone")
  private String orgPhoneNumber;

  public Organization() {}

  public Organization(
      String orgName,
      String orgWebsite,
      String orgEIN,
      String orgStreetAddress,
      String orgCity,
      String orgState,
      String orgZipcode,
      String orgEmail,
      String orgPhoneNumber)
      throws ValidationException {

    OrganizationValidationMessage ovm =
        Organization.isValid(
            orgName,
            orgWebsite,
            orgEIN,
            orgStreetAddress,
            orgCity,
            orgState,
            orgZipcode,
            orgEmail,
            orgPhoneNumber);

    if (ovm != OrganizationValidationMessage.VALID)
      throw new ValidationException(OrganizationValidationMessage.toOrganizationMessageJSON(ovm));

    this.orgName = orgName;
    this.orgWebsite = orgWebsite;
    this.orgEIN = orgEIN;
    this.orgStreetAddress = orgStreetAddress;
    this.orgCity = orgCity;
    this.orgState = orgState;
    this.orgZipcode = orgZipcode;
    this.orgEmail = orgEmail;
    this.orgPhoneNumber = orgPhoneNumber;
  }

  /** **************** GETTERS ********************* */
  public ObjectId getId() {
    return this.id;
  }

  public String getOrgName() {
    return this.orgName;
  }

  public String getOrgWebsite() {
    return this.orgWebsite;
  }

  public String getOrgEIN() {
    return this.orgEIN;
  }

  public String getOrgStreetAddress() {
    return this.orgStreetAddress;
  }

  public String getOrgCity() {
    return this.orgCity;
  }

  public String getOrgState() {
    return this.orgState;
  }

  public String getOrgZipcode() {
    return this.orgZipcode;
  }

  public String getOrgEmail() {
    return this.orgEmail;
  }

  public String getOrgPhoneNumber() {
    return this.orgPhoneNumber;
  }

  /** **************** SETTERS ********************* */
  public Organization setOrgName(String orgName) {
    this.orgName = orgName;
    return this;
  }

  public Organization setOrgWebsite(String website) {
    this.orgWebsite = website;
    return this;
  }

  public Organization setOrgEIN(String ein) {
    this.orgEIN = ein;
    return this;
  }

  public Organization setOrgStreetAddress(String address) {
    this.orgStreetAddress = address;
    return this;
  }

  public Organization setOrgCity(String city) {
    this.orgCity = city;
    return this;
  }

  public Organization setOrgState(String state) {
    this.orgState = state;
    return this;
  }

  public Organization setOrgZipcode(String zipcode) {
    this.orgZipcode = zipcode;
    return this;
  }

  public Organization setOrgEmail(String email) {
    this.orgEmail = email;
    return this;
  }

  public Organization setOrgPhoneNumber(String phoneNumber) {
    this.orgPhoneNumber = phoneNumber;
    return this;
  }

  private static OrganizationValidationMessage isValid(
      String orgName,
      String orgWebsite,
      String orgEIN,
      String orgStreetAddress,
      String orgCity,
      String orgState,
      String orgZipcode,
      String orgEmail,
      String orgPhoneNumber)
      throws SecurityException {
    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("OrganizationValidation");

    if (!ValidationUtils.isValidOrgName(orgName)) {
      logger.error("Invalid orgname: " + orgName);
      return OrganizationValidationMessage.INVALID_NAME;
    }
    if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
      logger.error("Invalid website: " + orgWebsite);
      return OrganizationValidationMessage.INVALID_WEBSITE;
    }
    if (!ValidationUtils.isValidEIN(orgEIN)) {
      logger.error("Invalid taxCode: " + orgEIN);
      return OrganizationValidationMessage.INVALID_EIN;
    }
    if (!ValidationUtils.isValidPhoneNumber(orgPhoneNumber)) {
      logger.error("Invalid orgContactPhoneNumber: " + orgPhoneNumber);
      return OrganizationValidationMessage.INVALID_PHONE;
    }
    if (!ValidationUtils.isValidEmail(orgEmail)) {
      logger.error("Invalid email: " + orgEmail);
      return OrganizationValidationMessage.INVALID_EMAIL;
    }
    if (!ValidationUtils.isValidAddress(orgStreetAddress)) {
      logger.error("Invalid address: " + orgStreetAddress);
      return OrganizationValidationMessage.INVALID_ADDRESS;
    }
    if (!ValidationUtils.isValidCity(orgCity)) {
      logger.error("Invalid city: " + orgCity);
      return OrganizationValidationMessage.INVALID_CITY;
    }
    if (!ValidationUtils.isValidUSState(orgState)) {
      logger.error("Invalid state: " + orgState);
      return OrganizationValidationMessage.INVALID_STATE;
    }
    if (!ValidationUtils.isValidZipCode(orgZipcode)) {
      logger.error("Invalid zipcode: " + orgZipcode);
      return OrganizationValidationMessage.INVALID_ZIPCODE;
    }
    return OrganizationValidationMessage.VALID;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder("Organization {");
    sb.append("id=").append(this.id);
    sb.append(", orgName=").append(this.orgName);
    sb.append(", orgWebsite=").append(this.orgWebsite);
    sb.append(", orgEIN=").append(this.orgEIN);
    sb.append(", orgStreetAddress=").append(this.orgStreetAddress);
    sb.append(", orgCity=").append(this.orgCity);
    sb.append(", orgState=").append(this.orgState);
    sb.append(", orgZipcode=").append(this.orgZipcode);
    sb.append(", orgEmail=").append(this.orgEmail);
    sb.append(", orgPhoneNumber=").append(this.orgPhoneNumber);
    sb.append("}");
    return sb.toString();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Organization org = (Organization) o;
    return Objects.equals(this.id, org.id)
        && Objects.equals(this.orgName, org.orgName)
        && Objects.equals(this.orgWebsite, org.orgWebsite)
        && Objects.equals(this.orgEIN, org.orgEIN)
        && Objects.equals(this.orgStreetAddress, org.orgStreetAddress)
        && Objects.equals(this.orgCity, org.orgCity)
        && Objects.equals(this.orgState, org.orgState)
        && Objects.equals(this.orgZipcode, org.orgZipcode)
        && Objects.equals(this.orgEmail, org.orgEmail)
        && Objects.equals(this.orgPhoneNumber, org.orgPhoneNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        this.id,
        this.orgName,
        this.orgWebsite,
        this.orgEIN,
        this.orgStreetAddress,
        this.orgCity,
        this.orgState,
        this.orgZipcode,
        this.orgEmail,
        this.orgPhoneNumber);
  }
}
