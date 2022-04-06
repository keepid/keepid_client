package FormTest;

import Config.Message;
import Database.Form.FormDao;
import Form.Form;
import Form.FormMessage;
import Form.FormType;
import Form.Services.UploadFormService;
import Security.EncryptionController;
import User.UserType;
import Validation.ValidationException;
import com.mongodb.client.MongoDatabase;
import org.bson.types.ObjectId;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class UploadFormServiceUnitTest {

  private FormDao formDao;

  List<Form> forms = new ArrayList<>();

  private UploadFormService uploadFormService;

  MongoDatabase db;
  InputStream filestream;
  EncryptionController encryptionController;
  JSONObject obj;

  @Before
  public void setup() {
    formDao = mock(FormDao.class);
    Form form1 = new Form();
    Form form2 = new Form();
    try {
      form1 =
          new Form(
              "username",
              null,
              new Date(),
              null,
              FormType.FORM,
              false,
              new Form.Metadata(
                  "title",
                  "description",
                  "state",
                  "county",
                  new HashSet<ObjectId>(),
                  new Date(),
                  new ArrayList<String>(),
                  0),
              new Form.Section("title", "description", new ArrayList<>(), new ArrayList<>()));
      form2 =
          new Form(
              "username",
              null,
              new Date(),
              null,
              FormType.FORM,
              false,
              new Form.Metadata(
                  "title",
                  "description",
                  "state",
                  "county",
                  new HashSet<ObjectId>(),
                  new Date(),
                  new ArrayList<String>(),
                  0),
              new Form.Section("title", "description", new ArrayList<>(), new ArrayList<>()));
    } catch (ValidationException ve) {
      log.error("Validation exception");
      // throw new ValidationException(obj);
    }
    forms.add(form1);
    forms.add(form2);
  }

  @Test
  public void insufficientPrivileges() {

    uploadFormService =
        new UploadFormService(
            db,
            "uploader",
            "org",
            UserType.Admin,
            FormType.FORM,
            "filename",
            "title",
            "filecontenttype",
            filestream,
            encryptionController);

    when(formDao.getAll()).thenReturn(forms);

    Message result = uploadFormService.executeAndGetResponse();
    Message result2 =
        uploadFormService.mongodbUpload(
            "uploader", "organizationName", "filename", "title", filestream, FormType.FORM, db);

    assertEquals(result, FormMessage.INSUFFICIENT_PRIVILEGE);
    // assertEquals(0, uploadFormService.getNumReturnedElements());
  }
}

  /*@Test
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
  }*/
// }
