package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PdfMessage;
import User.Services.GetUserInfoService;
import User.UserMessage;
import User.UserType;
import com.mongodb.client.MongoDatabase;
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
  // public static final int DEFAULT_SIGNATURE_FIELD_NUM_LINES = 4;
  // public static final int DEFAULT_PUSH_BUTTON_NUM_LINES = 3;
  // public static final int DEFAULT_CHECK_BOX_NUM_LINES = 3;

  UserType privilegeLevel;
  String username;
  JSONObject userInfo;
  InputStream fileStream;
  MongoDatabase db;
  Logger logger;
  JSONObject applicationInformation;

  public GetQuestionsPDFService(
      MongoDatabase db,
      Logger logger,
      UserType privilegeLevel,
      String username,
      InputStream fileStream) {
    this.db = db;
    this.logger = logger;
    this.privilegeLevel = privilegeLevel;
    this.username = username;
    this.fileStream = fileStream;

    // Now get the user's profile so we can autofill
    GetUserInfoService infoService = new GetUserInfoService(db, logger, username);
    Message response = infoService.executeAndGetResponse();
    JSONObject userInfo;
    if (response != UserMessage.SUCCESS) { // if fail return
      userInfo = null;
    } else {
      userInfo = infoService.getUserFields(); // get user info here
    }
    this.userInfo = userInfo;
  }

  @Override
  public Message executeAndGetResponse() {
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

  public JSONObject getApplicationInformation() {
    Objects.requireNonNull(applicationInformation);
    return applicationInformation;
  }

  /*
   @Param inputStream is the document
  */
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

    // TODO: Make this the filename received from the client instead because of null checking
    responseJSON.put("title", documentInformation.getTitle());
    responseJSON.put("description", documentInformation.getSubject());

    // Report the Fields
    List<PDField> fields = new LinkedList<>();
    fields.addAll(acroForm.getFields());

    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        JSONObject fieldJSON = null;
        if (field instanceof PDButton) {
          if (field instanceof PDCheckBox) {
            fieldJSON = getCheckBox((PDCheckBox) field);
          } else if (field instanceof PDPushButton) {
            // Do not do anything for a push button, we don't need them right now
            // fieldsJSON.add(getPushButton((PDPushButton) field));
          } else if (field instanceof PDRadioButton) {
            fieldJSON = getRadioButton((PDRadioButton) field);
          }
        } else if (field instanceof PDVariableText) {
          if (field instanceof PDChoice) {
            fieldJSON = getChoiceField((PDChoice) field);
          } else if (field instanceof PDTextField) {
            fieldJSON = getTextField((PDTextField) field);
          }
        } else if (field instanceof PDSignatureField) {
          // Do nothing, as signatures are dealt with in findSignatureFields
        }
        if (fieldJSON != null) {
          fieldsJSON.add(fieldJSON);
        }
      }

      // Delete field just gotten so we do not infinite recurse
      fields.remove(0);
    }
    pdfDocument.close();

    responseJSON.put("fields", fieldsJSON);
    this.applicationInformation = responseJSON;
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
    String fieldValueOptions = "[]";
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
    JSONArray optionsJSONArray = new JSONArray();
    optionsJSONArray.put(field.getOnValue());
    String fieldValueOptions = optionsJSONArray.toString();
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

  //  public static JSONObject getPushButton(PDPushButton field) {
  //    String fieldName = field.getFullyQualifiedName();
  //    String fieldType = "PushButton";
  //    String fieldValueOptions = "[]";
  //    String fieldDefaultValue = "";
  //    int numLines = DEFAULT_PUSH_BUTTON_NUM_LINES;
  //    String fieldQuestion = "Select the Button If You Want To " + field.getPartialName();
  //    return createFieldJSONEntry(
  //        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  //  }

  private JSONObject getRadioButton(PDRadioButton field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "RadioButton";
    JSONArray optionsJSONArray = new JSONArray();
    for (String choice : field.getOnValues()) {
      optionsJSONArray.put(choice);
    }
    String fieldValueOptions = optionsJSONArray.toString();
    String fieldDefaultValue = "Off";
    Boolean fieldIsRequired = field.isRequired();
    int numLines = 2 + optionsJSONArray.length();
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
    JSONArray optionsJSONArray = new JSONArray();
    for (String choice : field.getOptions()) {
      optionsJSONArray.put(choice);
    }
    String fieldValueOptions = optionsJSONArray.toString();
    String fieldDefaultValue = "Off";
    Boolean fieldIsRequired = field.isRequired();
    int numLines = optionsJSONArray.length() + 2;
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
      String fieldValueOptions,
      Object fieldDefaultValue,
      boolean fieldIsRequired,
      int fieldNumLines,
      String fieldQuestion) {
    JSONObject fieldJSON = new JSONObject();

    // TODO: Move into TextField?
    // Find if field is matched
    JSONObject userInfo = this.userInfo;
    String[] splitFieldName = fieldName.split(":");
    boolean fieldIsMatched = false;
    if (splitFieldName.length == 1) {
      // No annotation for matched field
    } else if (splitFieldName.length == 2) {
      // Annotation for matched field
      String fieldNameBase = splitFieldName[0];
      String fieldMatchedDBName = splitFieldName[1];
      // TODO: Better way of changing the question (could be a problem)
      fieldQuestion = fieldQuestion.replaceFirst(fieldName, fieldNameBase);

      if (fieldMatchedDBName.equals("anyDate")) {
        fieldType = "DateField";
      } else if (fieldMatchedDBName.equals("currentDate")) {
        // Make it matched because we should not modify the current date
        fieldType = "DateField";
        fieldIsMatched = true;
      } else if (fieldMatchedDBName.equals("signature")) {
        // Signatures not handles in first round of form completion
        return null;
      } else if (userInfo.has(fieldMatchedDBName)) {
        // Matched variable found
        fieldDefaultValue = userInfo.getString(fieldMatchedDBName);
        // fieldIsMatched = true;
      } else {
        // Matched not found
        logger.error("Error in Annotation for Field: " + fieldName + " - User Field not Found");
        return null;
      }
    } else {
      // Error in annotation - treat as normal without annotation
      logger.error("Error in Annotation for Field: " + fieldName + " - Invalid Format");
      return null;
    }

    fieldJSON.put("fieldName", fieldName);
    fieldJSON.put("fieldType", fieldType);
    fieldJSON.put("fieldValueOptions", new JSONArray(fieldValueOptions));
    fieldJSON.put("fieldDefaultValue", fieldDefaultValue);
    fieldJSON.put("fieldIsRequired", fieldIsRequired);
    fieldJSON.put("fieldNumLines", fieldNumLines);
    fieldJSON.put("fieldIsMatched", fieldIsMatched);
    fieldJSON.put("fieldQuestion", fieldQuestion);

    return fieldJSON;
  }
}
