package PDF.Services;

import Config.Message;
import Config.Service;
import Database.User.UserDao;
import PDF.PdfMessage;
import User.Services.GetUserInfoService;
import User.UserMessage;
import User.UserType;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

public class GetQuestionsPDFService implements Service {
  public static final int DEFAULT_FIELD_NUM_LINES = 3;

  UserType privilegeLevel;
  String username;
  JSONObject userInfo;
  InputStream fileStream;
  UserDao userDao;
  Logger logger;
  JSONObject applicationInformation;

  public GetQuestionsPDFService(
      UserDao userDao,
      Logger logger,
      UserType privilegeLevel,
      String username,
      InputStream fileStream) {
    this.userDao = userDao;
    this.logger = logger;
    this.privilegeLevel = privilegeLevel;
    this.username = username;
    this.fileStream = fileStream;
  }

  @Override
  public Message executeAndGetResponse() {
    // First, get the user's profile so we can autofill the field questions
    GetUserInfoService userInfoService = new GetUserInfoService(userDao, logger, username);
    Message userInfoServiceResponse = userInfoService.executeAndGetResponse();
    if (userInfoServiceResponse != UserMessage.SUCCESS) {
      return PdfMessage.SERVER_ERROR;
    } else {
      this.userInfo = userInfoService.getUserFields();
      if (fileStream == null) {
        return PdfMessage.INVALID_PDF;
      } else {
        if (privilegeLevel == UserType.Client
            || privilegeLevel == UserType.Worker
            || privilegeLevel == UserType.Director
            || privilegeLevel == UserType.Admin) {
          try {
            return getFieldInformation(fileStream);
          } catch (IOException e) {
            return PdfMessage.SERVER_ERROR;
          }
        } else {
          return PdfMessage.INSUFFICIENT_PRIVILEGE;
        }
      }
    }
  }

  public JSONObject getApplicationInformation() {
    Objects.requireNonNull(applicationInformation);
    return applicationInformation;
  }

  public Message getFieldInformation(InputStream inputStream) throws IOException {
    PDDocument pdfDocument = PDDocument.load(inputStream);
    pdfDocument.setAllSecurityToBeRemoved(true);
    JSONObject responseJSON = new JSONObject();
    List<JSONObject> fieldsJSON = new LinkedList<>();

    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    if (acroForm == null) {
      pdfDocument.close();
      return PdfMessage.INVALID_PDF;
    }

    // Report the Metadata
    PDDocumentInformation documentInformation = pdfDocument.getDocumentInformation();
    // TODO: Make this the filename the client side receives from metadata
    //  and pass it to this method
    responseJSON.put("title", documentInformation.getTitle());
    responseJSON.put("description", documentInformation.getSubject());

    // Make a copy of the fields
    List<PDField> fields = new LinkedList<>();
    fields.addAll(acroForm.getFields());

    while (!fields.isEmpty()) {
      PDField field = fields.remove(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children, continue recursing
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        // If the field is a leaf, then get the relevant data and return it
        if (field instanceof PDButton) {
          if (field instanceof PDCheckBox) {
            fieldsJSON.add(getCheckBox((PDCheckBox) field));
          } else if (field instanceof PDPushButton) {
            // Do not do anything for a push button, as we don't need to support them right now
          } else if (field instanceof PDRadioButton) {
            fieldsJSON.add(getRadioButton((PDRadioButton) field));
          }
        } else if (field instanceof PDVariableText) {
          if (field instanceof PDChoice) {
            fieldsJSON.add(getChoiceField((PDChoice) field));
          } else if (field instanceof PDTextField) {
            fieldsJSON.add(getTextField((PDTextField) field));
          }
        } else if (field instanceof PDSignatureField) {
          // Do nothing, as signatures are dealt with in findSignatureFields
        }
      }
    }
    fieldsJSON.removeIf(field -> field == null);
    responseJSON.put("fields", fieldsJSON);
    this.applicationInformation = responseJSON;

    pdfDocument.close();
    return PdfMessage.SUCCESS;
  }

  private JSONObject getTextField(PDTextField field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType;
    String fieldQuestion;
    if (field.isReadOnly()) {
      fieldType = "ReadOnlyField";
      fieldQuestion = field.getPartialName();
      String fieldValue = field.getValue();
      if (fieldValue != null && !fieldValue.equals("")) {
        fieldQuestion += ": " + fieldValue;
      }
    } else if (field.isMultiline()) {
      fieldType = "MultilineTextField";
      fieldQuestion = "Please Enter Your: " + field.getPartialName();
    } else {
      fieldType = "TextField";
      fieldQuestion = "Please Enter Your: " + field.getPartialName();
    }
    JSONArray fieldValueOptions = new JSONArray();
    String fieldDefaultValue = "";
    Boolean fieldIsRequired = field.isRequired();
    int numLines = DEFAULT_FIELD_NUM_LINES;
    return createFieldJSONEntry(
        fieldName,
        fieldType,
        fieldValueOptions,
        fieldDefaultValue,
        fieldIsRequired,
        numLines,
        fieldQuestion);
  }

  private JSONObject getCheckBox(PDCheckBox field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "CheckBox";
    JSONArray fieldValueOptions = new JSONArray();
    fieldValueOptions.put(field.getOnValue());
    Boolean fieldDefaultValue = Boolean.FALSE;
    Boolean fieldIsRequired = field.isRequired();
    int numLines = DEFAULT_FIELD_NUM_LINES;
    String fieldQuestion = "Please Select: " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName,
        fieldType,
        fieldValueOptions,
        fieldDefaultValue,
        fieldIsRequired,
        numLines,
        fieldQuestion);
  }

  private JSONObject getRadioButton(PDRadioButton field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "RadioButton";
    JSONArray fieldValueOptions = new JSONArray();
    for (String choice : field.getOnValues()) {
      fieldValueOptions.put(choice);
    }
    String fieldDefaultValue = "Off";
    Boolean fieldIsRequired = field.isRequired();
    int numLines = 2 + fieldValueOptions.length();
    String fieldQuestion = "Please Select One Option for: " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName,
        fieldType,
        fieldValueOptions,
        fieldDefaultValue,
        fieldIsRequired,
        numLines,
        fieldQuestion);
  }

  private JSONObject getChoiceField(PDChoice field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType, fieldQuestion;
    if (field instanceof PDComboBox) {
      fieldType = "ComboBox";
    } else {
      fieldType = "ListBox";
    }
    JSONArray fieldValueOptions = new JSONArray();
    for (String choice : field.getOptions()) {
      fieldValueOptions.put(choice);
    }
    String fieldDefaultValue = "Off";
    Boolean fieldIsRequired = field.isRequired();
    int numLines = fieldValueOptions.length() + 2;
    if (field.isMultiSelect()) {
      fieldQuestion =
          "Please Select Option(s) for: "
              + field.getPartialName()
              + " (you can select multiple options with CTRL)";
    } else {
      fieldQuestion = "Please Select an Option for: " + field.getPartialName();
    }
    return createFieldJSONEntry(
        fieldName,
        fieldType,
        fieldValueOptions,
        fieldDefaultValue,
        fieldIsRequired,
        numLines,
        fieldQuestion);
  }

  private JSONObject createFieldJSONEntry(
      String fieldName,
      String fieldType,
      JSONArray fieldValueOptions,
      Object fieldDefaultValue,
      boolean fieldIsRequired,
      int fieldNumLines,
      String fieldQuestion) {

    // TODO: Move into getTextField(), since only textFields can be autofilled right now
    // Parse field matching directions in the field name
    boolean fieldIsMatched = false;
    String[] splitFieldName = fieldName.split(":");
    if (splitFieldName.length == 1) {
      // No annotation for matched field
    } else if (splitFieldName.length == 2) {
      // Annotation for matched field
      String fieldNameBase = splitFieldName[0];
      String fieldDirective = splitFieldName[1];
      // TODO: Make a better way of changing the question fieldName (as current method is clumsy)
      fieldQuestion = fieldQuestion.replaceFirst(fieldName, fieldNameBase);

      if (fieldDirective.equals("anyDate")) {
        // Make it a date field that can be selected by the client
        fieldType = "DateField";
      } else if (fieldDirective.equals("currentDate")) {
        // Make it a date field with the current date that cannot be changed
        fieldType = "DateField";
        fieldIsMatched = true;
      } else if (fieldDirective.equals("signature")) {
        // Signatures not handled in first round of form completion
        return null;
      } else if (this.userInfo.has(fieldDirective)) {
        // Field has a matched database variable
        fieldDefaultValue = this.userInfo.getString(fieldDirective);
        fieldIsMatched = true;
      } else {
        // Match not found
        logger.error("Error in Annotation for Field: " + fieldName + " - Directive not Understood");
        return null;
      }
    } else {
      // Error in annotation - treat as normal without annotation
      logger.error("Error in Annotation for Field: " + fieldName + " - Invalid Format");
      return null;
    }

    // If no errors in matching, return a fieldJSON
    JSONObject fieldJSON = new JSONObject();
    fieldJSON.put("fieldName", fieldName);
    fieldJSON.put("fieldType", fieldType);
    fieldJSON.put("fieldValueOptions", fieldValueOptions);
    fieldJSON.put("fieldDefaultValue", fieldDefaultValue);
    fieldJSON.put("fieldIsRequired", fieldIsRequired);
    fieldJSON.put("fieldNumLines", fieldNumLines);
    fieldJSON.put("fieldIsMatched", fieldIsMatched);
    fieldJSON.put("fieldQuestion", fieldQuestion);
    return fieldJSON;
  }
}
