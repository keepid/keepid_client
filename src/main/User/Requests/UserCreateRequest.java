package User.Requests;

import User.UserType;
import org.bson.codecs.pojo.annotations.BsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserCreateRequest
{
  @BsonProperty(value = "firstName")
  @JsonProperty("firstName")
  private String firstName;

  @BsonProperty(value = "lastName")
  @JsonProperty("lastName")
  private String lastName;

  @BsonProperty(value = "birthDate")
  @JsonProperty("birthDate")
  private String birthDate;

  @BsonProperty(value = "email")
  @JsonProperty("email")
  private String email;

  @BsonProperty(value = "phone")
  @JsonProperty("phone")
  private String phone;

  @BsonProperty(value = "address")
  @JsonProperty("address")
  private String address;

  @BsonProperty(value = "city")
  @JsonProperty("city")
  private String city;

  @BsonProperty(value = "state")
  @JsonProperty("state")
  private String state;

  @BsonProperty(value = "zipcode")
  @JsonProperty("zipcode")
  private String zipcode;

  @BsonProperty(value = "privilegeLevel")
  @JsonProperty("privilegeLevel")
  private UserType userType;

  @BsonProperty(value = "organization")
  private String organization;

  @BsonProperty(value = "username")
  private String username;

  @BsonProperty(value = "password")
  private String password;


  /** **************** GETTERS ********************* */
  public String getFirstName() { return firstName; }

  public String getLastName() { return lastName; }

  public String getBirthDate() { return birthDate; }

  public String getEmail() { return email; }

  public String getPhone() { return phone; }

  public String getAddress() { return address; }

  public String getCity() { return city; }

  public String getState() { return state; }

  public String getZipcode() { return zipcode; }

  public UserType getUserType() { return userType; }

  public String getOrganization() { return organization; }

  public String getUsername() { return username; }

  public String getPassword() { return password; }

  /** **************** SETTERS ********************* */
  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public void setBirthDate(String birthDate) {
    this.birthDate = birthDate;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public void setState(String state) {
    this.state = state;
  }

  public void setZipcode(String zipcode) {
    this.zipcode = zipcode;
  }

  public void setOrganization(String organization) { this.organization = organization; }

  public void setUserType(UserType userType) { this.userType = userType; }

  public void setUsername(String username) { this.username = username; }

  public void setPassword(String password) { this.password = password; }
}
