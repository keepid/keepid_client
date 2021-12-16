package User.Requests;

import org.bson.codecs.pojo.annotations.BsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Optional;

public class UserUpdateRequest
{
  @BsonProperty(value = "firstName")
  @JsonProperty("firstName")
  private Optional<String> firstName;

  @BsonProperty(value = "lastName")
  @JsonProperty("lastName")
  private Optional<String> lastName;

  @BsonProperty(value = "birthDate")
  @JsonProperty("birthDate")
  private Optional<String> birthDate;

  @BsonProperty(value = "email")
  @JsonProperty("email")
  private Optional<String> email;

  @BsonProperty(value = "phone")
  @JsonProperty("phone")
  private Optional<String> phone;

  @BsonProperty(value = "address")
  @JsonProperty("address")
  private Optional<String> address;

  @BsonProperty(value = "city")
  @JsonProperty("city")
  private Optional<String> city;

  @BsonProperty(value = "state")
  @JsonProperty("state")
  private Optional<String> state;

  @BsonProperty(value = "zipcode")
  @JsonProperty("zipcode")
  private Optional<String> zipcode;


  /** **************** GETTERS ********************* */
  public Optional<String> getFirstName() { return firstName; }

  public Optional<String> getLastName() { return lastName; }

  public Optional<String> getBirthDate() { return birthDate; }

  public Optional<String> getEmail() { return email; }

  public Optional<String> getPhone() { return phone; }

  public Optional<String> getAddress() { return address; }

  public Optional<String> getCity() { return city; }

  public Optional<String> getState() { return state; }

  public Optional<String> getZipcode() { return zipcode; }

  /** **************** SETTERS ********************* */
  public void setFirstName(String firstName) {
    this.firstName = Optional.ofNullable(firstName);
  }

  public void setLastName(String lastName) {
    this.lastName = Optional.ofNullable(lastName);
  }

  public void setBirthDate(String birthDate) {
    this.birthDate = Optional.ofNullable(birthDate);
  }

  public void setEmail(String email) {
    this.email = Optional.ofNullable(email);
  }

  public void setPhone(String phone) {
    this.phone = Optional.ofNullable(phone);
  }

  public void setAddress(String address) {
    this.address = Optional.ofNullable(address);
  }

  public void setCity(String city) {
    this.city = Optional.ofNullable(city);
  }

  public void setState(String state) {
    this.state = Optional.ofNullable(state);
  }

  public void setZipcode(String zipcode) {
    this.zipcode = Optional.ofNullable(zipcode);
  }
}
