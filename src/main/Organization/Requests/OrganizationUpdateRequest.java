package Organization.Requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.util.Date;
import java.util.Optional;

public class OrganizationUpdateRequest {
  @BsonProperty(value = "orgName")
  private Optional<String> orgName;

  @BsonProperty(value = "orgWebsite")
  @JsonProperty("orgWebsite")
  private Optional<String> orgWebsite;

  @BsonProperty(value = "orgEIN")
  @JsonProperty("orgEIN")
  private Optional<String> orgEIN;

  @BsonProperty(value = "orgStreetAddress")
  @JsonProperty("orgStreetAddress")
  private Optional<String> orgStreetAddress;

  @BsonProperty(value = "orgCity")
  @JsonProperty("orgCity")
  private Optional<String> orgCity;

  @BsonProperty(value = "orgState")
  @JsonProperty("orgState")
  private Optional<String> orgState;

  @BsonProperty(value = "orgZipcode")
  @JsonProperty("orgZipcode")
  private Optional<String> orgZipcode;

  @BsonProperty(value = "orgEmail")
  @JsonProperty("orgEmail")
  private Optional<String> orgEmail;

  @BsonProperty(value = "orgPhoneNumber")
  @JsonProperty("orgPhoneNumber")
  private Optional<String> orgPhoneNumber;

  /** **************** GETTERS ********************* */

  public Optional<String> getOrgName() {
    return this.orgName;
  }

  public Optional<String> getOrgWebsite() {
    return this.orgWebsite;
  }

  public Optional<String> getOrgEIN() {
    return this.orgEIN;
  }

  public Optional<String> getOrgStreetAddress() {
    return this.orgStreetAddress;
  }

  public Optional<String> getOrgCity() {
    return this.orgCity;
  }

  public Optional<String> getOrgState() {
    return this.orgState;
  }

  public Optional<String> getOrgZipcode() {
    return this.orgZipcode;
  }

  public Optional<String> getOrgEmail() {
    return this.orgEmail;
  }

  public Optional<String> getOrgPhoneNumber() {
    return this.orgPhoneNumber;
  }

  /** **************** SETTERS ********************* */
  public OrganizationUpdateRequest setOrgName(String orgName) {
    this.orgName = Optional.ofNullable(orgName);
    return this;
  }

  public OrganizationUpdateRequest setOrgWebsite(String website) {
    this.orgWebsite = Optional.ofNullable(website);
    return this;
  }

  public OrganizationUpdateRequest setOrgEIN(String ein) {
    this.orgEIN = Optional.ofNullable(ein);
    return this;
  }

  public OrganizationUpdateRequest setOrgStreetAddress(String address) {
    this.orgStreetAddress = Optional.ofNullable(address);
    return this;
  }

  public OrganizationUpdateRequest setOrgCity(String city) {
    this.orgCity = Optional.ofNullable(city);
    return this;
  }

  public OrganizationUpdateRequest setOrgState(String state) {
    this.orgState = Optional.ofNullable(state);
    return this;
  }

  public OrganizationUpdateRequest setOrgZipcode(String zipcode) {
    this.orgZipcode = Optional.ofNullable(zipcode);
    return this;
  }

  public OrganizationUpdateRequest setOrgEmail(String email) {
    this.orgEmail = Optional.ofNullable(email);
    return this;
  }

  public OrganizationUpdateRequest setOrgPhoneNumber(String phoneNumber) {
    this.orgPhoneNumber = Optional.ofNullable(phoneNumber);
    return this;
  }
}
