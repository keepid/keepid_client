package Form.Services;

import Config.Message;
import Config.Service;
import Database.Form.FormDao;
import Form.Form;
import Form.FormMessage;
import Form.FormType;
import User.UserType;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Date;

public class UploadFormService implements Service {

  String uploader;
  UserType privilegeLevel;

  FormType formType;
  FormDao formDao;

  Form.Metadata metadata;
  Form.Section body;
  boolean isTemplate;

  public UploadFormService(
      FormDao formDao,
      String uploaderUsername,
      UserType privilegeLevel,
      FormType formType,
      Form.Metadata metadata,
      Form.Section body,
      boolean isTemplate) {
    this.formDao = formDao;
    this.uploader = uploaderUsername;
    this.privilegeLevel = privilegeLevel;
    this.formType = formType;
    this.metadata = metadata;
    this.body = body;
    this.isTemplate = isTemplate;
  }

  @Override
  public Message executeAndGetResponse() {
    if (formType == null) {
      return FormMessage.INVALID_FORM_TYPE;
    } else if (metadata == null) {
      return FormMessage.INVALID_FORM;
    } else if (body == null) {
      return FormMessage.INVALID_FORM;
    } else {
      if ((formType == FormType.APPLICATION
              || formType == FormType.IDENTIFICATION
              || formType == FormType.FORM)
          && (privilegeLevel == UserType.Client
              || privilegeLevel == UserType.Worker
              || privilegeLevel == UserType.Director
              || privilegeLevel == UserType.Admin
              || privilegeLevel == UserType.Developer)) {
        try {
          return mongodbUpload(uploader, metadata, body, formType, formDao, isTemplate);
        } catch (GeneralSecurityException | IOException e) {
          return FormMessage.SERVER_ERROR;
        }
      } else {
        return FormMessage.INSUFFICIENT_PRIVILEGE;
      }
    }
  }

  public Message mongodbUpload(
      String uploader,
      Form.Metadata metadata,
      Form.Section body,
      FormType formType,
      FormDao formDao,
      boolean isTemplate)
      throws GeneralSecurityException, IOException {
    formDao.save(new Form(uploader, null, new Date(), null, formType, isTemplate, metadata, body));
    return FormMessage.SUCCESS;
  }
}
