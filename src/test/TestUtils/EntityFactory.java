package TestUtils;

import Activity.Activity;
import Database.Dao;
import Form.Form;
import Form.Form.Metadata;
import Form.Form.Section;
import Form.FormType;
import Organization.Organization;
import Security.SecurityUtils;
import Security.Tokens;
import User.IpObject;
import User.User;
import User.UserType;
import Validation.ValidationException;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.*;

public class EntityFactory {
  public static final long TEST_DATE = 1577862000000L; // Jan 1 2020

  public static PartialUser createUser() {
    return new PartialUser();
  }

  public static PartialOrganization createOrganization() {
    return new PartialOrganization();
  }

  public static PartialTokens createTokens() {
    return new PartialTokens();
  }

  public static PartialActivity createActivity() {
    return new PartialActivity();
  }

  public static PartialForm createForm() {
    return new PartialForm();
  }

  public static class PartialForm implements PartialObject<Form> {
    // new
    private int defaultNumLines = 10;
    private String username = "testFirstName";
    private Optional<String> uploaderUsername = Optional.of("testuploadername");
    private Date uploadedAt = new Date(TEST_DATE);
    private Optional<Date> lastModifiedAt = Optional.of(new Date(TEST_DATE));
    private FormType formType = FormType.FORM;
    private boolean isTemplate = false;
    private Metadata metadata =
        new Metadata(
            "title",
            "description",
            "state",
            "county",
            new HashSet<ObjectId>(),
            new Date(),
            new ArrayList<String>(),
            defaultNumLines);
    private List<Section> body = new ArrayList<Section>();

    @Override
    public Form build() {
      Form newForm =
          new Form(
              username,
              uploaderUsername,
              uploadedAt,
              lastModifiedAt,
              formType,
              isTemplate,
              metadata,
              body);
      return newForm;
    }

    @Override
    public Form buildAndPersist(Dao<Form> dao) {
      Form form = this.build();
      dao.save(form);
      return form;
    }

    public PartialForm withUsername(String username) {
      this.username = username;
      return this;
    }

    public PartialForm withUploaderUsername(Optional<String> uploaderUsername) {
      this.uploaderUsername = uploaderUsername;
      return this;
    }

    public PartialForm withUploadedAt(Date uploadedAt) {
      this.uploadedAt = uploadedAt;
      return this;
    }

    public PartialForm withLastModifiedAt(Optional<Date> lastModifiedAt) {
      this.lastModifiedAt = lastModifiedAt;
      return this;
    }

    public PartialForm withFormType(FormType formType) {
      this.formType = formType;
      return this;
    }

    public PartialForm withIsTemplate(boolean isTemplate) {
      this.isTemplate = isTemplate;
      return this;
    }

    public PartialForm withMetadata(Metadata metadata) {
      this.metadata = metadata;
      return this;
    }

    public PartialForm withBody(List<Section> body) {
      this.body = body;
      return this;
    }
  }

  public static class PartialUser implements PartialObject<User> {
    private String firstName = "testFirstName";
    private String lastName = "testLastName";
    private String birthDate = "12-14-1997";
    private String email = "testemail@keep.id";
    private String phone = "1231231234";
    private String organization = "testOrganizationName";
    private String address = "123 Test St Av";
    private String city = "Philadelphia";
    private String state = "PA";
    private String zipcode = "19104";
    private String username = "testUser123";
    private String password = "testUser123";
    private UserType userType = UserType.Client;
    private boolean twoFactorOn = false;
    private Date creationDate = new Date(TEST_DATE);
    private List<IpObject> logInHistory = new ArrayList<>();

    @Override
    public User build() {
      try {
        User newUser =
            new User(
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
                twoFactorOn,
                username,
                password,
                userType);
        newUser.setLogInHistory(logInHistory);
        newUser.setCreationDate(creationDate);
        return newUser;
      } catch (ValidationException e) {
        throw new IllegalArgumentException("Illegal Param: " + e.toString());
      }
    }

    @Override
    public User buildAndPersist(Dao<User> dao) {
      User user = this.build();
      dao.save(user);
      return user;
    }

    public PartialUser withFirstName(String firstName) {
      this.firstName = firstName;
      return this;
    }

    public PartialUser withLastName(String lastName) {
      this.lastName = lastName;
      return this;
    }

    public PartialUser withBirthDate(String birthDate) {
      this.birthDate = birthDate;
      return this;
    }

    public PartialUser withEmail(String email) {
      this.email = email;
      return this;
    }

    public PartialUser withPhoneNumber(String phoneNumber) {
      this.phone = phoneNumber;
      return this;
    }

    public PartialUser withOrgName(String orgName) {
      this.organization = orgName;
      return this;
    }

    public PartialUser withAddress(String address) {
      this.address = address;
      return this;
    }

    public PartialUser withCity(String city) {
      this.city = city;
      return this;
    }

    public PartialUser withState(String state) {
      this.state = state;
      return this;
    }

    public PartialUser withZipcode(String zipcode) {
      this.zipcode = zipcode;
      return this;
    }

    public PartialUser withUsername(String username) {
      this.username = username;
      return this;
    }

    public PartialUser withPassword(String password) {
      this.password = password;
      return this;
    }

    public PartialUser withPasswordToHash(String password) {
      this.password = SecurityUtils.hashPassword(password);
      return this;
    }

    public PartialUser withUserType(UserType userType) {
      this.userType = userType;
      return this;
    }

    public PartialUser withTwoFactorState(boolean isTwoFactorOn) {
      this.twoFactorOn = isTwoFactorOn;
      return this;
    }

    public PartialUser withCreationDate(Date creationDate) {
      this.creationDate = creationDate;
      return this;
    }

    public PartialUser withLoginHistory(List<IpObject> logInHistory) {
      this.logInHistory = logInHistory;
      return this;
    }
  }

  public static class PartialOrganization implements PartialObject<Organization> {
    private String orgName = "testOrganizationName";
    private String orgWebsite = "https://www.example.org/somethinghere";
    private String orgEIN = "123456789";
    private String orgStreetAddress = "311 Broad Street";
    private String orgCity = "Philadelphia";
    private String orgState = "PA";
    private String orgZipcode = "19104";
    private String orgEmail = "testOrgEmail@keep.id";
    private String orgPhoneNumber = "1234567890";
    private Date creationDate = new Date(TEST_DATE);

    @Override
    public Organization build() {
      try {
        Organization newOrg =
            new Organization(
                orgName,
                orgWebsite,
                orgEIN,
                orgStreetAddress,
                orgCity,
                orgState,
                orgZipcode,
                orgEmail,
                orgPhoneNumber);
        newOrg.setCreationDate(creationDate);
        return newOrg;
      } catch (ValidationException e) {
        throw new IllegalArgumentException("Illegal Param: " + e.toString());
      }
    }

    @Override
    public Organization buildAndPersist(Dao<Organization> dao) {
      Organization organization = this.build();
      dao.save(organization);
      return organization;
    }

    public PartialOrganization withAddress(String address) {
      this.orgStreetAddress = address;
      return this;
    }

    public PartialOrganization withCity(String city) {
      this.orgCity = city;
      return this;
    }

    public PartialOrganization withState(String state) {
      this.orgState = state;
      return this;
    }

    public PartialOrganization withZipcode(String zipcode) {
      this.orgZipcode = zipcode;
      return this;
    }

    public PartialOrganization withEmail(String email) {
      this.orgEmail = email;
      return this;
    }

    public PartialOrganization withEIN(String ein) {
      this.orgEIN = ein;
      return this;
    }

    public PartialOrganization withOrgName(String orgName) {
      this.orgName = orgName;
      return this;
    }

    public PartialOrganization withWebsite(String website) {
      this.orgWebsite = website;
      return this;
    }

    public PartialOrganization withPhoneNumber(String phoneNumber) {
      this.orgPhoneNumber = phoneNumber;
      return this;
    }

    public PartialOrganization withCreationDate(Date creationDate) {
      this.creationDate = creationDate;
      return this;
    }
  }

  public interface PartialObject<T> {
    public T build();

    public T buildAndPersist(Dao<T> dao);
  }

  public static class PartialTokens implements PartialObject<Tokens> {
    private ObjectId id = new ObjectId();
    private String username = "testUser123";
    private String resetJwt =
        SecurityUtils.createJWT(
            id.toString(), "KeepID", username, "Password Reset Confirmation", 72000000);
    private String twoFactorCode = "444555";
    private Date twoFactorExp = new Date(Long.valueOf("3786930000000"));

    @Override
    public Tokens build() {
      Tokens newTokens =
          new Tokens()
              .setId(id)
              .setUsername(username)
              .setResetJwt(resetJwt)
              .setTwoFactorCode(twoFactorCode)
              .setTwoFactorExp(twoFactorExp);
      return newTokens;
    }

    @Override
    public Tokens buildAndPersist(Dao<Tokens> dao) {
      Tokens tokens = this.build();
      dao.save(tokens);
      return tokens;
    }

    public PartialTokens withId(ObjectId id) {
      this.id = id;
      return this;
    }

    public PartialTokens withUsername(String username) {
      this.username = username;
      return this;
    }

    public PartialTokens withResetJwt(String resetJwt) {
      this.resetJwt = resetJwt;
      return this;
    }

    public PartialTokens withTwoFactorCode(String twoFactorCode) {
      this.twoFactorExp = twoFactorExp;
      return this;
    }

    public PartialTokens withTwoFactorExp(Date twoFactorExp) {
      this.twoFactorExp = twoFactorExp;
      return this;
    }
  }

  public static class PartialActivity implements PartialObject<Activity> {
    private ObjectId id = new ObjectId();
    private LocalDateTime occuredAt = LocalDateTime.now();
    private User owner = EntityFactory.createUser().build();
    private List<String> type = Collections.emptyList();

    @Override
    public Activity build() {
      Activity newActivity = new Activity().setOccurredAt(occuredAt).setOwner(owner).setType(type);
      return newActivity;
    }

    @Override
    public Activity buildAndPersist(Dao<Activity> dao) {
      Activity activity = this.build();
      dao.save(activity);
      return activity;
    }

    public PartialActivity withId(ObjectId id) {
      this.id = id;
      return this;
    }

    public PartialActivity withLocalDateTime(LocalDateTime occuredAt) {
      this.occuredAt = occuredAt;
      return this;
    }

    public PartialActivity withOwner(User owner) {
      this.owner = owner;
      return this;
    }

    public PartialActivity withType(List<String> type) {
      this.type = type;
      return this;
    }
  }
}
