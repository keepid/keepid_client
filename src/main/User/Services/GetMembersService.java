package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import User.User;
import User.UserMessage;
import User.UserType;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import me.xdrop.fuzzywuzzy.model.BoundExtractedResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.util.List;
import java.util.Objects;

public class GetMembersService implements Service {
  UserDao userDao;
  Logger logger;
  private String orgName;
  private UserType privilegeLevel;
  private String searchValue;
  private ListType listType;
  private JSONArray people;
  private int startIndex;
  private int endIndex;
  private JSONArray peoplePage;
  private int numReturnedElements;

  public static final int NUM_ELEMENTS_TO_RETURN = 80;

  public GetMembersService(
      UserDao userDao,
      Logger logger,
      String searchValue,
      String orgName,
      UserType privilegeLevel,
      String listType,
      int currentPage,
      int itemsPerPage) {
    this.userDao = userDao;
    this.logger = logger;
    this.searchValue = searchValue;
    this.orgName = orgName;
    this.privilegeLevel = privilegeLevel;
    this.listType = ListType.valueOf(listType);
    this.startIndex = currentPage * itemsPerPage;
    this.endIndex = (currentPage + 1) * itemsPerPage;
  }

  public enum ListType {
    CLIENTS,
    MEMBERS;
  }

  @Override
  public Message executeAndGetResponse() {
    if (privilegeLevel == null || orgName == null) {
      logger.error("Session Token Failure");
      return UserMessage.SESSION_TOKEN_FAILURE;
    }
    Objects.requireNonNull(searchValue);
    Objects.requireNonNull(orgName);
    Objects.requireNonNull(privilegeLevel);
    Objects.requireNonNull(listType);
    if (searchValue.trim().isBlank()) {
      return UserMessage.USER_NOT_FOUND;
    }
    if (!typeMatch(privilegeLevel, listType)) {
      return UserMessage.INSUFFICIENT_PRIVILEGE;
    }
    List<User> allUsers = userDao.getAll();

    JSONArray userList = new JSONArray();

    // Fuzzy search to rank results by threshold
    List<BoundExtractedResult<User>> users =
        FuzzySearch.extractSorted(
            searchValue, allUsers, x -> x.getFirstName() + " " + x.getLastName());

    int numReturnedElements = 0;
    for (BoundExtractedResult<User> user : users) {
      if (numReturnedElements < NUM_ELEMENTS_TO_RETURN) {
        numReturnedElements += constructUserList(user.getReferent(), listType, userList);
      }
    }

    this.numReturnedElements = numReturnedElements;
    this.peoplePage = userList;
    logger.info("Successfully returned member information");
    return UserMessage.SUCCESS;
  }

  public int getNumReturnedElements() {
    return numReturnedElements;
  }

  public JSONArray getPeoplePage() {
    Objects.requireNonNull(peoplePage);
    return peoplePage;
  }

  private static JSONArray getPage(JSONArray elements, int pageStartIndex, int pageEndIndex) {
    JSONArray page = new JSONArray();
    if (elements.length() > pageStartIndex && pageStartIndex >= 0) {
      if (pageEndIndex > elements.length()) {
        pageEndIndex = elements.length();
      }
      for (int i = pageStartIndex; i < pageEndIndex; i++) {
        page.put(elements.get(i));
      }
    }
    return page;
  }

  // Return 1 if added to list to keep total below threshold
  private int constructUserList(User user, ListType listType, JSONArray userList) {
    JSONObject userJSON = user.serialize();
    logger.info("Getting member information");
    if (typeMatch(user.getUserType(), listType)) {
      userList.put(userJSON);
      return 1;
    }
    return 0;
  }

  private boolean typeMatch(UserType userType, ListType listType) {
    if (listType == ListType.CLIENTS) {
      return userType == UserType.Worker
          || userType == UserType.Admin
          || userType == UserType.Director;
    } else if (listType == ListType.MEMBERS) {
      return userType == UserType.Client;
    } else {
      return false;
    }
  }
}
