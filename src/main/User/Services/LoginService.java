package User.Services;

import Activity.ActivityController;
import Activity.LoginActivity;
import Config.Message;
import Config.Service;
import Database.Token.TokenDao;
import Database.User.UserDao;
import Issue.IssueController;
import Security.EmailExceptions;
import Security.EmailUtil;
import Security.SecurityUtils;
import Security.Tokens;
import User.IpObject;
import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationUtils;
import io.ipinfo.api.IPInfo;
import io.ipinfo.api.errors.RateLimitedException;
import io.ipinfo.api.model.IPResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class LoginService implements Service {
  public final String IP_INFO_TOKEN = Objects.requireNonNull(System.getenv("IPINFO_TOKEN"));
  private Logger logger;
  private UserDao userDao;
  private TokenDao tokenDao;
  private String username;
  private String password;
  private User user;
  private String ip;
  private String userAgent;
  private ActivityController activityController;
  public static final long JWT_EXPIRATION_IN_MILI = 300000;

  public LoginService(
      UserDao userDao,
      TokenDao tokenDao,
      Logger logger,
      String username,
      String password,
      String ip,
      String userAgent) {
    this.userDao = userDao;
    this.tokenDao = tokenDao;
    this.logger = logger;
    this.username = username;
    this.password = password;
    this.ip = ip;
    this.userAgent = userAgent;
    activityController = new ActivityController();
  }

  // the execute function will handle all business logic
  public Message executeAndGetResponse() {
    // validation
    if (!ValidationUtils.isValidUsername(this.username)
        || !ValidationUtils.isValidPassword(this.password)) {
      logger.info("Invalid username and/or password");
      return UserMessage.AUTH_FAILURE;
    }
    // get user

    Optional<User> optionalUser = userDao.get(this.username);
    if (optionalUser.isEmpty()) {
      return UserMessage.AUTH_FAILURE;
    }
    user = optionalUser.get();
    // verify password
    if (!verifyPassword(this.password, user.getPassword())) {
      return UserMessage.AUTH_FAILURE;
    }
    recordActivityLogin(); // record login activity
    getLocationOfLogin(user, ip, userAgent); // get ip location
    logger.info("Login Successful!");
    // if two factor is on, run 2fa
    if (user.getTwoFactorOn()
        && (user.getUserType() == UserType.Director
            || user.getUserType() == UserType.Admin
            || user.getUserType() == UserType.Worker)) {
      return perform2FA(user.getEmail());
    }
    return UserMessage.AUTH_SUCCESS;
  }

  public void recordActivityLogin() {
    LoginActivity log = new LoginActivity(user, user.getTwoFactorOn());
    activityController.addActivity(log);
  }

  public void getLocationOfLogin(User user, String ip, String userAgent) {
    List<IpObject> loginList = user.getLogInHistory();
    if (loginList == null) {
      loginList = new ArrayList<IpObject>(1000);
    }
    if (loginList.size() >= 1000) {
      loginList.remove(0);
    }
    logger.info("Trying to add login to login history");

    IpObject thisLogin = new IpObject();
    ZonedDateTime currentTime = ZonedDateTime.now();
    String formattedDate =
        currentTime.format(DateTimeFormatter.ofPattern("MM/dd/YYYY, HH:mm")) + " Local Time";
    boolean isMobile = userAgent.contains("Mobi");
    String device = isMobile ? "Mobile" : "Computer";

    thisLogin.setDate(formattedDate);
    thisLogin.setIp(ip);
    thisLogin.setDevice(device);

    IPInfo ipInfo = IPInfo.builder().setToken(IP_INFO_TOKEN).build();
    try {
      IPResponse response = ipInfo.lookupIP(ip);
      thisLogin.setLocation(
          response.getPostal() + ", " + response.getCity() + "," + response.getRegion());
    } catch (RateLimitedException ex) {
      logger.error("Failed to retrieve login location due to limited rates for IPInfo.com");
      thisLogin.setLocation("Unknown");
      JSONObject body = new JSONObject();
      body.put(
          "text",
          "You are receiving this because we have arrived at maximum amount of IP "
              + "lookups we are allowed for our free plan.");
      Unirest.post(IssueController.issueReportActualURL).body(body.toString()).asEmpty();
    }
    loginList.add(thisLogin);
    addLoginHistoryToDB(loginList);
  }

  public void addLoginHistoryToDB(List<IpObject> loginList) {
    user.setLogInHistory(loginList);
    userDao.update(user);
    logger.info("Added login to login history");
  }

  public Message perform2FA(String email) {
    String randCode = String.format("%06d", new Random().nextInt(999999));
    Date expDate = new Date(System.currentTimeMillis() + JWT_EXPIRATION_IN_MILI);
    try {
      String emailContent = EmailUtil.getVerificationCodeEmail(randCode);
      EmailUtil.sendEmail("Keep Id", email, "Keepid Verification Code", emailContent);
      saveJWTToDb(randCode, expDate);
    } catch (EmailExceptions emailException) {
      logger.error("Could not send email");
      return emailException;
    }
    return UserMessage.TOKEN_ISSUED;
  }

  public void saveJWTToDb(String randomCode, Date expirationDate) {
    tokenDao.replaceOne(
        username,
        new Tokens()
            .setUsername(username)
            .setTwoFactorCode(randomCode)
            .setTwoFactorExp(expirationDate));
  }

  public boolean verifyPassword(String inputPassword, String userHash) {
    SecurityUtils.PassHashEnum verifyPasswordStatus =
        SecurityUtils.verifyPassword(inputPassword, userHash);
    switch (verifyPasswordStatus) {
      case SUCCESS:
        return true;
      case ERROR:
        {
          logger.error("Failed to hash password");
          return false;
        }
      case FAILURE:
        {
          logger.info("Incorrect password");
          return false;
        }
    }
    return false;
  }

  public UserType getUserRole() {
    Objects.requireNonNull(user);
    return user.getUserType();
  }

  public String getOrganization() {
    Objects.requireNonNull(user);
    return user.getOrganization();
  }

  public String getUsername() {
    Objects.requireNonNull(user);
    return user.getUsername();
  }

  public String getFirstName() {
    Objects.requireNonNull(user);
    return user.getFirstName();
  }

  public String getLastName() {
    Objects.requireNonNull(user);
    return user.getLastName();
  }

  public String getFullName() {
    Objects.requireNonNull(user);
    return user.getFirstName() + " " + user.getLastName();
  }

  public boolean isTwoFactorOn() {
    Objects.requireNonNull(user);
    return user.getTwoFactorOn();
  }
}
