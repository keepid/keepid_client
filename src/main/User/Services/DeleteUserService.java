package User.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import PDF.PDFType;
import Security.SecurityUtils;
import User.User;
import User.UserMessage;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
public class DeleteUserService implements Service {
  private MongoDatabase db;
  private UserDao userDao;
  private String username;
  private String password;
  private User user;

  public DeleteUserService(MongoDatabase db, UserDao userDao, String username, String password) {
    this.db = db;
    this.userDao = userDao;
    this.username = username;
    this.password = password;
  }

  @Override
  public Message executeAndGetResponse() {
    // validation
    if (!ValidationUtils.isValidPassword(password)) {
      log.info("Invalid password");
      return UserMessage.AUTH_FAILURE;
    }

    // get user
    Optional<User> optionalUser = userDao.get(username);
    if (optionalUser.isEmpty()) {
      return UserMessage.AUTH_FAILURE;
    }
    user = optionalUser.get();

    // verify password
    if (!verifyPassword(password, user.getPassword())) {
      return UserMessage.AUTH_FAILURE;
    }

    deleteUserFiles();
    userDao.delete(user.getUsername());
    return UserMessage.SUCCESS;
  }

  public void deleteUserFiles() {
    // Form
    GridFSBucket gridBucket = GridFSBuckets.create(db, PDFType.FORM.toString());
    List<GridFSFile> files =
        gridBucket
            .find(Filters.eq("metadata.uploader", user.getUsername()))
            .into(new ArrayList<>());

    for (GridFSFile file : files) {
      gridBucket.delete(file.getObjectId());
    }

    // Application
    GridFSBucket gridBucket2 = GridFSBuckets.create(db, PDFType.APPLICATION.toString());
    List<GridFSFile> files2 =
        gridBucket2
            .find(Filters.eq("metadata.uploader", user.getUsername()))
            .into(new ArrayList<>());

    for (GridFSFile file2 : files2) {
      gridBucket2.delete(file2.getObjectId());
    }

    // Identification
    GridFSBucket gridBucket3 = GridFSBuckets.create(db, PDFType.IDENTIFICATION.toString());
    List<GridFSFile> files3 =
        gridBucket3
            .find(Filters.eq("metadata.uploader", user.getUsername()))
            .into(new ArrayList<>());

    for (GridFSFile file3 : files3) {
      gridBucket3.delete(file3.getObjectId());
    }
  }

  public boolean verifyPassword(String inputPassword, String userHash) {
    SecurityUtils.PassHashEnum verifyPasswordStatus =
        SecurityUtils.verifyPassword(inputPassword, userHash);
    switch (verifyPasswordStatus) {
      case SUCCESS:
        return true;
      case ERROR:
        {
          log.error("Failed to hash password");
          return false;
        }
      case FAILURE:
        {
          log.info("Incorrect password");
          return false;
        }
    }
    return false;
  }
}
