package User;

import Organization.Organization;
import Organization.Requests.OrganizationUpdateRequest;
import User.Requests.UserUpdateRequest;
import Validation.ValidationException;
import Validation.ValidationUtils;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.bson.codecs.pojo.annotations.BsonDiscriminator;
import org.bson.codecs.pojo.annotations.BsonId;
import org.bson.codecs.pojo.annotations.BsonIgnore;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Setter
public class User {
  private ObjectId id;

  @BsonProperty(value = "firstName")
  private String firstName;

  @BsonProperty(value = "lastName")
  private String lastName;

  @BsonProperty(value = "birthDate")
  private String birthDate;

  @BsonProperty(value = "email")
  private String email;

  @BsonProperty(value = "phone")
  private String phone;

  @BsonProperty(value = "organization")
  private String organization;

  @BsonProperty(value = "address")
  private String address;

  @BsonProperty(value = "city")
  private String city;

  @BsonProperty(value = "state")
  private String state;

  @BsonProperty(value = "zipcode")
  private String zipcode;

  @BsonProperty(value = "username")
  private String username;

  @BsonProperty(value = "password")
  private String password;

  @BsonProperty(value = "privilegeLevel")
  @JsonProperty("privilegeLevel")
  private UserType userType;

  @BsonProperty(value = "twoFactorOn")
  private boolean twoFactorOn;

  @BsonProperty(value = "creationDate")
  private Date creationDate;

  @BsonProperty(value = "logInHistory")
  private List<IpObject> logInHistory;

  public User() {}

  public User(
      String firstName,
      String lastName,
      String birthDate,
      String email,
      String phone,
      String organization,
      String address,
      String city,
      String state,
      String zipcode,
      Boolean twoFactorOn,
      String username,
      String password,
      UserType userType)
      throws ValidationException {

    UserValidationMessage validationMessage =
        User.isValid(
            firstName,
            lastName,
            birthDate,
            email,
            phone,
            organization,
            address,
            city,
            state,
            zipcode,
            username,
            password,
            userType);

    if (validationMessage != UserValidationMessage.VALID)
      throw new ValidationException(UserValidationMessage.toUserMessageJSON(validationMessage));

    Date date = new Date();

    this.id = new ObjectId();
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.email = email;
    this.phone = phone;
    this.organization = organization;
    this.address = address;
    this.city = city;
    this.state = state;
    this.zipcode = zipcode;
    this.twoFactorOn = twoFactorOn;
    this.username = username;
    this.password = password;
    this.userType = userType;
    this.creationDate = date;
  }

  /** **************** GETTERS ********************* */
  public ObjectId getId() {
    return this.id;
  }

  public String getFirstName() {
    return this.firstName;
  }

  public String getLastName() {
    return this.lastName;
  }

  public String getBirthDate() {
    return this.birthDate;
  }

  public String getEmail() {
    return this.email;
  }

  public String getPhone() {
    return this.phone;
  }

  public String getOrganization() {
    return this.organization;
  }

  public String getAddress() {
    return this.address;
  }

  public String getCity() {
    return this.city;
  }

  public String getState() {
    return this.state;
  }

  public String getZipcode() {
    return this.zipcode;
  }

  public String getUsername() {
    return this.username;
  }

  public String getPassword() {
    return this.password;
  }

  public UserType getUserType() {
    return this.userType;
  }

  public boolean getTwoFactorOn() {
    return this.twoFactorOn;
  }

  public Date getCreationDate() {
    return this.creationDate;
  }

  public List<IpObject> getLogInHistory() {
    return this.logInHistory;
  }

  /** **************** SETTERS ********************* */
  public User setFirstName(String firstName) {
    this.firstName = firstName;
    return this;
  }

  public User setLastName(String lastName) {
    this.lastName = lastName;
    return this;
  }

  public User setBirthDate(String birthDate) {
    this.birthDate = birthDate;
    return this;
  }

  public User setEmail(String email) {
    this.email = email;
    return this;
  }

  public User setPhone(String phone) {
    this.phone = phone;
    return this;
  }

  public User setOrganization(String organization) {
    this.organization = organization;
    return this;
  }

  public User setAddress(String address) {
    this.address = address;
    return this;
  }

  public User setCity(String city) {
    this.city = city;
    return this;
  }

  public User setCreationDate(Date date) {
    this.creationDate = date;
    return this;
  }

  public User setState(String state) {
    this.state = state;
    return this;
  }

  public User setZipcode(String zipcode) {
    this.zipcode = zipcode;
    return this;
  }

  public User setTwoFactorOn(Boolean twoFactorOn) {
    this.twoFactorOn = twoFactorOn;
    return this;
  }

  public User setUsername(String username) {
    this.username = username;
    return this;
  }

  public User setPassword(String password) {
    this.password = password;
    return this;
  }

  public User setUserType(UserType userType) {
    this.userType = userType;
    return this;
  }

  public User setLogInHistory(List<IpObject> logInHistory) {
    this.logInHistory = logInHistory;
    return this;
  }

  private static UserValidationMessage isValid(
      String firstName,
      String lastName,
      String birthDate,
      String email,
      String phone,
      String organization,
      String address,
      String city,
      String state,
      String zipcode,
      String username,
      String password,
      UserType userType) {

    if (!ValidationUtils.isValidFirstName(firstName)) {
      log.error("Invalid firstName: " + firstName);
      return UserValidationMessage.INVALID_FIRSTNAME;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      log.error("Invalid lastName: " + lastName);
      return UserValidationMessage.INVALID_LASTNAME;
    }
    if (!ValidationUtils.isValidBirthDate(birthDate)) {
      log.error("Invalid birthDate: " + birthDate);
      return UserValidationMessage.INVALID_BIRTHDATE;
    }
    if (!ValidationUtils.isValidPhoneNumber(phone)) {
      log.error("Invalid orgContactPhoneNumber: " + phone);
      return UserValidationMessage.INVALID_PHONENUMBER;
    }
    if (!ValidationUtils.isValidOrganizationName(organization)) {
      log.error("Invalid organization: " + organization);
      return UserValidationMessage.INVALID_ORGANIZATION;
    }
    if (!ValidationUtils.isValidEmail(email)) {
      log.error("Invalid email: " + email);
      return UserValidationMessage.INVALID_EMAIL;
    }
    if (!ValidationUtils.isValidAddress(address)) {
      log.error("Invalid address: " + address);
      return UserValidationMessage.INVALID_ADDRESS;
    }
    if (!ValidationUtils.isValidCity(city)) {
      log.error("Invalid city: " + city);
      return UserValidationMessage.INVALID_CITY;
    }
    if (!ValidationUtils.isValidUSState(state)) {
      log.error("Invalid state: " + state);
      return UserValidationMessage.INVALID_STATE;
    }
    if (!ValidationUtils.isValidZipCode(zipcode)) {
      log.error("Invalid zipcode: " + zipcode);
      return UserValidationMessage.INVALID_ZIPCODE;
    }
    if (!ValidationUtils.isValidUsername(username)) {
      log.error("Invalid username: " + username);
      return UserValidationMessage.INVALID_USERNAME;
    }
    if (!ValidationUtils.isValidPassword(password)) {
      log.error("Invalid password: " + password);
      return UserValidationMessage.INVALID_PASSWORD;
    }
    if (!ValidationUtils.isValidUserType(userType.toString())) {
      log.error("Invalid UserType: " + userType);
      return UserValidationMessage.INVALID_USERTYPE;
    }

    return UserValidationMessage.VALID;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder("User {");
    sb.append("id=").append(this.id.toHexString());
    sb.append(", firstName=").append(this.firstName);
    sb.append(", lastName=").append(this.lastName);
    sb.append(", birthDate=").append(this.birthDate);
    sb.append(", email=").append(this.email);
    sb.append(", phone=").append(this.phone);
    sb.append(", address=").append(this.address);
    sb.append(", city=").append(this.city);
    sb.append(", state=").append(this.state);
    sb.append(", zipcode=").append(this.zipcode);
    sb.append(", username=").append(this.username);
    sb.append(", password=").append(this.password);
    sb.append(", userType=").append(this.userType);
    sb.append(", twoFactorOn=").append(this.twoFactorOn);
    sb.append(", creationDate=").append(this.creationDate);
    sb.append("}");
    return sb.toString();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    User user = (User) o;
    return Objects.equals(this.id, user.id)
        && Objects.equals(this.firstName, user.firstName)
        && Objects.equals(this.lastName, user.lastName)
        && Objects.equals(this.birthDate, user.birthDate)
        && Objects.equals(this.email, user.email)
        && Objects.equals(this.phone, user.phone)
        && Objects.equals(this.address, user.address)
        && Objects.equals(this.city, user.city)
        && Objects.equals(this.state, user.state)
        && Objects.equals(this.zipcode, user.zipcode)
        && Objects.equals(this.username, user.username)
        && Objects.equals(this.password, user.password)
        && Objects.equals(this.userType, user.userType)
        && Objects.equals(this.twoFactorOn, user.twoFactorOn);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        this.id,
        this.firstName,
        this.lastName,
        this.birthDate,
        this.email,
        this.phone,
        this.address,
        this.city,
        this.state,
        this.zipcode,
        this.username,
        this.password,
        this.userType,
        this.twoFactorOn);
  }

  public JSONObject serialize() {
    JSONObject userJSON = new JSONObject();
    userJSON.put("username", username);
    userJSON.put("birthDate", birthDate);
    userJSON.put("privilegeLevel", userType);
    userJSON.put("userType", userType);
    userJSON.put("firstName", firstName);
    userJSON.put("lastName", lastName);
    userJSON.put("email", email);
    userJSON.put("phone", phone);
    userJSON.put("address", address);
    userJSON.put("city", city);
    userJSON.put("state", state);
    userJSON.put("zipcode", zipcode);
    userJSON.put("organization", organization);
    userJSON.put("logInHistory", logInHistory);
    userJSON.put("creationDate", creationDate);
    userJSON.put("twoFactorOn", twoFactorOn);
    return userJSON;
  }

  public Map<String, Object> toMap() {
    ObjectMapper objectMapper = new ObjectMapper();
    Map<String, Object> result =
        objectMapper.convertValue(this, new TypeReference<Map<String, Object>>() {});
    result.remove("id");
    return result;
  }

  public User updateProperties (UserUpdateRequest updateRequest) {
    if (updateRequest.getFirstName() != null && updateRequest.getFirstName().isPresent()) {
      this.setFirstName(updateRequest.getFirstName().get());
    }

    if (updateRequest.getLastName() != null && updateRequest.getLastName().isPresent()) {
      this.setLastName(updateRequest.getLastName().get());
    }

    if (updateRequest.getBirthDate() != null && updateRequest.getBirthDate().isPresent()) {
      this.setBirthDate(updateRequest.getBirthDate().get());
    }

    if (updateRequest.getEmail() != null && updateRequest.getEmail().isPresent()) {
      this.setEmail(updateRequest.getEmail().get());
    }

    if (updateRequest.getPhone() != null && updateRequest.getPhone().isPresent()) {
      this.setPhone(updateRequest.getPhone().get());
    }

    if (updateRequest.getAddress() != null && updateRequest.getAddress().isPresent()) {
      this.setAddress(updateRequest.getAddress().get());
    }

    if (updateRequest.getCity() != null && updateRequest.getCity().isPresent()) {
      this.setCity(updateRequest.getCity().get());
    }

    if (updateRequest.getState() != null && updateRequest.getState().isPresent()) {
      this.setState(updateRequest.getState().get());
    }

    if (updateRequest.getZipcode() != null && updateRequest.getZipcode().isPresent()) {
      this.setZipcode(updateRequest.getZipcode().get());
    }

    return this;
  }
}
