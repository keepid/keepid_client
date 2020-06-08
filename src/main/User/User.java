package User;

import Logger.LogFactory;
import Validation.ValidationMessage;
import Validation.ValidationUtils;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.slf4j.Logger;

import java.util.Objects;

public class User {
  private ObjectId id;

  @BsonProperty(value = "firstname")
  private String firstName;

  @BsonProperty(value = "lastname")
  private String lastName;

  @BsonProperty(value = "birthdate")
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

  @BsonProperty(value = "privilege-level")
  private UserType userType;

  @BsonProperty(value = "can-edit")
  private boolean canEdit;

  @BsonProperty(value = "can-view")
  private boolean canView;

  @BsonProperty(value = "can-register")
  private boolean canRegister;

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
      String username,
      String password,
      UserType userType) {

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
    this.username = username;
    this.password = password;
    this.userType = userType;
    this.calcPermissions();
  }

  private void calcPermissions() {
    this.canEdit = this.userType == UserType.Director || this.userType == UserType.Admin;
    this.canView = this.userType == UserType.Director || this.userType == UserType.Admin;
    this.canRegister = this.userType == UserType.Director || this.userType == UserType.Admin;
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

  public boolean getCanEdit() {
    return this.canEdit;
  }

  public boolean getCanView() {
    return this.canView;
  }

  public boolean getCanRegister() {
    return this.canRegister;
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

  public User setState(String state) {
    this.state = state;
    return this;
  }

  public User setZipcode(String zipcode) {
    this.zipcode = zipcode;
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

  public User setCanEdit(boolean canEdit) {
    this.canEdit = canEdit;
    return this;
  }

  public User setCanView(boolean canView) {
    this.canView = canView;
    return this;
  }

  public User setCanRegister(boolean canRegister) {
    this.canRegister = canRegister;
    return this;
  }

  public static ValidationMessage isValid(
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
      String userType)
      throws SecurityException {

    LogFactory l = new LogFactory();
    Logger logger = l.createLogger("UserValidation");

    if (!ValidationUtils.isValidFirstName(firstName)) {
      logger.error("Invalid firstName: " + firstName);
      return ValidationMessage.INVALID_FIRSTNAME;
    }
    if (!ValidationUtils.isValidLastName(lastName)) {
      logger.error("Invalid lastName: " + lastName);
      return ValidationMessage.INVALID_LASTNAME;
    }
    if (!ValidationUtils.isValidBirthDate(birthDate)) {
      logger.error("Invalid birthDate: " + birthDate);
      return ValidationMessage.INVALID_BIRTHDATE;
    }
    if (!ValidationUtils.isValidPhoneNumber(phone)) {
      logger.error("Invalid orgContactPhoneNumber: " + phone);
      return ValidationMessage.INVALID_PHONENUMBER;
    }
    if (!ValidationUtils.isValidOrganizationName(organization)) {
      logger.error("Invalid organization: " + organization);
      return ValidationMessage.INVALID_ORGANIZATION;
    }
    if (!ValidationUtils.isValidEmail(email)) {
      logger.error("Invalid email: " + email);
      return ValidationMessage.INVALID_EMAIL;
    }
    if (!ValidationUtils.isValidAddress(address)) {
      logger.error("Invalid address: " + address);
      return ValidationMessage.INVALID_ADDRESS;
    }
    if (!ValidationUtils.isValidCity(city)) {
      logger.error("Invalid city: " + city);
      return ValidationMessage.INVALID_CITY;
    }
    if (!ValidationUtils.isValidUSState(state)) {
      logger.error("Invalid state: " + state);
      return ValidationMessage.INVALID_STATE;
    }
    if (!ValidationUtils.isValidZipCode(zipcode)) {
      logger.error("Invalid zipcode: " + zipcode);
      return ValidationMessage.INVALID_ZIPCODE;
    }
    if (!ValidationUtils.isValidUsername(username)) {
      logger.error("Invalid username: " + username);
      return ValidationMessage.INVALID_USERNAME;
    }
    if (!ValidationUtils.isValidPassword(password)) {
      logger.error("Invalid password: " + password);
      return ValidationMessage.INVALID_PASSWORD;
    }
    if (!ValidationUtils.isValidUserType(userType)) {
      logger.error("Invalid UserType: " + userType);
      return ValidationMessage.INVALID_USERTYPE;
    }

    return ValidationMessage.VALID;
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder("User {");
    sb.append("id=").append(this.id);
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
    sb.append(", canEdit=").append(this.canEdit);
    sb.append(", canView=").append(this.canView);
    sb.append(", canRegister=").append(this.canRegister);
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
        && Objects.equals(this.canEdit, user.canEdit)
        && Objects.equals(this.canView, user.canView)
        && Objects.equals(this.canRegister, user.canRegister);
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
        this.canEdit,
        this.canView,
        this.canRegister);
  }
}
