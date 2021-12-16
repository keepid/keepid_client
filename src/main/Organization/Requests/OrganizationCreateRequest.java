package Organization.Requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.Date;
import java.util.Optional;

public class OrganizationCreateRequest {
  @BsonProperty(value = "orgName")
  private String orgName;

  @BsonProperty(value = "orgWebsite")
  @JsonProperty("orgWebsite")
  private String orgWebsite;

  @BsonProperty(value = "orgEIN")
  @JsonProperty("orgEIN")
  private String orgEIN;

  @BsonProperty(value = "orgStreetAddress")
  @JsonProperty("orgStreetAddress")
  private String orgStreetAddress;

  @BsonProperty(value = "orgCity")
  @JsonProperty("orgCity")
  private String orgCity;

  @BsonProperty(value = "orgState")
  @JsonProperty("orgState")
  private String orgState;

  @BsonProperty(value = "orgZipcode")
  @JsonProperty("orgZipcode")
  private String orgZipcode;

  @BsonProperty(value = "orgEmail")
  @JsonProperty("orgEmail")
  private String orgEmail;

  @BsonProperty(value = "orgPhoneNumber")
  @JsonProperty("orgPhoneNumber")
  private String orgPhoneNumber;

  /** **************** GETTERS ********************* */

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
  public OrganizationCreateRequest setOrgName(String orgName) {
    this.orgName = orgName;
    return this;
  }

  public OrganizationCreateRequest setOrgWebsite(String website) {
    this.orgWebsite = website;
    return this;
  }

  public OrganizationCreateRequest setOrgEIN(String ein) {
    this.orgEIN = ein;
    return this;
  }

  public OrganizationCreateRequest setOrgStreetAddress(String address) {
    this.orgStreetAddress = address;
    return this;
  }

  public OrganizationCreateRequest setOrgCity(String city) {
    this.orgCity = city;
    return this;
  }

  public OrganizationCreateRequest setOrgState(String state) {
    this.orgState = state;
    return this;
  }

  public OrganizationCreateRequest setOrgZipcode(String zipcode) {
    this.orgZipcode = zipcode;
    return this;
  }

  public OrganizationCreateRequest setOrgEmail(String email) {
    this.orgEmail = email;
    return this;
  }

  public OrganizationCreateRequest setOrgPhoneNumber(String phoneNumber) {
    this.orgPhoneNumber = phoneNumber;
    return this;
  }
}
