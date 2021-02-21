package UserTest;

import Config.Message;
import Database.User.UserDao;
import User.Services.GetMembersService;
import User.User;
import User.UserMessage;
import User.UserType;
import Validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@Slf4j
public class GetMembersServiceUnitTest {

  private UserDao userDao;

  List<User> users = new ArrayList<>();

  private GetMembersService getMembersService;

  @Before
  public void setup() {
    userDao = mock(UserDao.class);
    User user1 = new User();
    User user2 = new User();
    try {
      user1 =
          new User(
              "Firstname",
              "Lastname",
              "09-04-1978",
              "workertff@broadstreetministry.org",
              "2152839504",
              "Broad Street Ministry",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "testUsername",
              "testPassword",
              UserType.Client);
      user2 =
          new User(
              "Testfirssttwo",
              "Testlasttwo",
              "09-04-1978",
              "workertff@broadstreetministry.org",
              "2152839504",
              "Broad Street Ministry",
              "311 Broad Street",
              "Philadelphia",
              "PA",
              "19104",
              false,
              "testUsername",
              "testPassword",
              UserType.Client);
    } catch (ValidationException ve) {
      log.error("Validation exception");
    }
    users.add(user1);
    users.add(user2);
  }

  @Test
  public void insufficientPrivileges() {

    getMembersService = new GetMembersService(userDao, "Firstname", "", UserType.Client, "CLIENTS");

    when(userDao.getAll()).thenReturn(users);

    Message result = getMembersService.executeAndGetResponse();

    assertEquals(result, UserMessage.INSUFFICIENT_PRIVILEGE);
    assertEquals(0, getMembersService.getNumReturnedElements());
  }

  @Test
  public void happyPath() {

    getMembersService =
        new GetMembersService(userDao, "Firstname", "test", UserType.Admin, "CLIENTS");

    when(userDao.getAllFromOrg("test")).thenReturn(users);

    Message result = getMembersService.executeAndGetResponse();

    assertEquals(result, UserMessage.SUCCESS);
    assertEquals(2, getMembersService.getNumReturnedElements());

    JSONObject user1 = (JSONObject) getMembersService.getPeoplePage().get(0);
    JSONObject user2 = (JSONObject) getMembersService.getPeoplePage().get(1);

    assertEquals("Firstname", user1.get("firstName"));
    assertEquals("Testfirssttwo", user2.get("firstName"));
  }

  @Test
  public void happyPathSearchUser2First() {

    getMembersService =
        new GetMembersService(userDao, "Testfirssttwo", "test", UserType.Admin, "CLIENTS");

    when(userDao.getAllFromOrg("test")).thenReturn(users);

    Message result = getMembersService.executeAndGetResponse();

    assertEquals(result, UserMessage.SUCCESS);
    assertEquals(2, getMembersService.getNumReturnedElements());

    JSONObject user1 = (JSONObject) getMembersService.getPeoplePage().get(0);
    JSONObject user2 = (JSONObject) getMembersService.getPeoplePage().get(1);

    assertEquals("Testfirssttwo", user1.get("firstName"));
    assertEquals("Firstname", user2.get("firstName"));
  }
}
