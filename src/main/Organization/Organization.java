package Organization;

import Validation.ValidationException;
import Validation.ValidationUtils;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Setter
public class Organization implements Serializable {
  private ObjectId id;

  @BsonProperty(value = "orgName")
  private String orgName;

  @BsonProperty(value = "website")
  @JsonProperty("website")
  private String orgWebsite;

  @BsonProperty(value = "ein")
  @JsonProperty("ein")
  private String orgEIN;

  @BsonProperty(value = "address")
  @JsonProperty("address")
  private String orgStreetAddress;

  @BsonProperty(value = "city")
  @JsonProperty("city")
  private String orgCity;

  @BsonProperty(value = "state")
  @JsonProperty("state")
  private String orgState;

  @BsonProperty(value = "zipcode")
  @JsonProperty("zipcode")
  private String orgZipcode;

  @BsonProperty(value = "email")
  @JsonProperty("email")
  private String orgEmail;

  @BsonProperty(value = "phone")
  @JsonProperty("phone")
  private String orgPhoneNumber;

  @BsonProperty(value = "creationDate")
  private Date creationDate;

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

    Date date = new Date();

    this.orgName = orgName;
    this.orgWebsite = orgWebsite;
    this.orgEIN = orgEIN;
    this.orgStreetAddress = orgStreetAddress;
    this.orgCity = orgCity;
    this.orgState = orgState;
    this.orgZipcode = orgZipcode;
    this.orgEmail = orgEmail;
    this.orgPhoneNumber = orgPhoneNumber;
    this.creationDate = date;
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

  public Date getCreationDate() {
    return this.creationDate;
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

  public Organization setCreationDate(Date creationDate) {
    this.creationDate = creationDate;
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

    if (!ValidationUtils.isValidOrgName(orgName)) {
      log.error("Invalid orgname: " + orgName);
      return OrganizationValidationMessage.INVALID_NAME;
    }
    if (!ValidationUtils.isValidOrgWebsite(orgWebsite)) {
      log.error("Invalid website: " + orgWebsite);
      return OrganizationValidationMessage.INVALID_WEBSITE;
    }
    if (!ValidationUtils.isValidEIN(orgEIN)) {
      log.error("Invalid taxCode: " + orgEIN);
      return OrganizationValidationMessage.INVALID_EIN;
    }
    if (!ValidationUtils.isValidPhoneNumber(orgPhoneNumber)) {
      log.error("Invalid orgContactPhoneNumber: " + orgPhoneNumber);
      return OrganizationValidationMessage.INVALID_PHONE;
    }
    if (!ValidationUtils.isValidEmail(orgEmail)) {
      log.error("Invalid email: " + orgEmail);
      return OrganizationValidationMessage.INVALID_EMAIL;
    }
    if (!ValidationUtils.isValidAddress(orgStreetAddress)) {
      log.error("Invalid address: " + orgStreetAddress);
      return OrganizationValidationMessage.INVALID_ADDRESS;
    }
    if (!ValidationUtils.isValidCity(orgCity)) {
      log.error("Invalid city: " + orgCity);
      return OrganizationValidationMessage.INVALID_CITY;
    }
    if (!ValidationUtils.isValidUSState(orgState)) {
      log.error("Invalid state: " + orgState);
      return OrganizationValidationMessage.INVALID_STATE;
    }
    if (!ValidationUtils.isValidZipCode(orgZipcode)) {
      log.error("Invalid zipcode: " + orgZipcode);
      return OrganizationValidationMessage.INVALID_ZIPCODE;
    }
    return OrganizationValidationMessage.VALID;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder("Organization {");
    sb.append("id=").append(this.id.toHexString());
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

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    Map<String, Object> result =
        objectMapper.convertValue(this, new TypeReference<Map<String, Object>>() {});
    result.remove("id");
    return result;
  }
}
