package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PdfMessage;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import org.apache.pdfbox.pdmodel.PDDocument;
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
  public static final int DEFAULT_TEXT_FIELD_NUM_LINES = 3;
  public static final int DEFAULT_SIGNATURE_FIELD_NUM_LINES = 4;
  public static final int DEFAULT_PUSH_BUTTON_NUM_LINES = 3;
  public static final int DEFAULT_CHECK_BOX_NUM_LINES = 3;

  UserType privilegeLevel;
  InputStream fileStream;
  MongoDatabase db;
  Logger logger;
  List<JSONObject> applicationQuestions;

  public GetQuestionsPDFService(
      MongoDatabase db, Logger logger, UserType privilegeLevel, InputStream fileStream) {
    this.db = db;
    this.logger = logger;
    this.privilegeLevel = privilegeLevel;
    this.fileStream = fileStream;
    this.applicationQuestions = applicationQuestions;
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
          applicationQuestions = getFieldInformation(fileStream);
        } catch (IOException e) {
          return PdfMessage.SERVER_ERROR;
        }
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
      return PdfMessage.SUCCESS;
    }
  }

  public List<JSONObject> getApplicationQuestions() {
    Objects.requireNonNull(applicationQuestions);
    return applicationQuestions;
  }
  /*
   @Param inputStream is the document
  */
  public static List<JSONObject> getFieldInformation(InputStream inputStream) throws IOException {
    if (inputStream == null) {
      throw new IllegalArgumentException();
    }
    PDDocument pdfDocument = PDDocument.load(inputStream);
    pdfDocument.setAllSecurityToBeRemoved(true);
    List<JSONObject> fieldsJSON = new LinkedList<>();

    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    if (acroForm == null) {
      // form with no fields
      return fieldsJSON;
    }
    List<PDField> fields = new LinkedList<>();
    fields.addAll(acroForm.getFields());
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        if (field instanceof PDButton) {
          if (field instanceof PDCheckBox) {
            fieldsJSON.add(getCheckBox((PDCheckBox) field));
          } else if (field instanceof PDPushButton) {
            // Do not do anything for a push button, we don't need them right now
            // fieldsJSON.add(getPushButton((PDPushButton) field));
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

      // Delete field just gotten so we do not infinite recurse
      fields.remove(0);
    }
    pdfDocument.close();

    return fieldsJSON;
  }

  private static JSONObject getTextField(PDTextField field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "TextField";
    String fieldValueOptions = "[]";
    String fieldDefaultValue = "";
    int numLines = DEFAULT_TEXT_FIELD_NUM_LINES;
    String fieldQuestion = "Please Enter Your " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  }

  private static JSONObject getCheckBox(PDCheckBox field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "CheckBox";
    JSONArray optionsJSONArray = new JSONArray();
    optionsJSONArray.put(field.getOnValue());
    String fieldValueOptions = optionsJSONArray.toString();
    Boolean fieldDefaultValue = Boolean.FALSE;
    int numLines = DEFAULT_CHECK_BOX_NUM_LINES;
    String fieldQuestion = "Please select an option for " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
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

  private static JSONObject getRadioButton(PDRadioButton field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "RadioButton";
    JSONArray optionsJSONArray = new JSONArray();
    for (String choice : field.getOnValues()) {
      optionsJSONArray.put(choice);
    }
    String fieldValueOptions = optionsJSONArray.toString();
    String fieldDefaultValue = "Off";
    int numLines = 2 + optionsJSONArray.length();
    String fieldQuestion = "Please select one option for " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  }

  private static JSONObject getChoiceField(PDChoice field) {
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
    int numLines = optionsJSONArray.length() + 2;
    if (field.isMultiSelect()) {
      fieldQuestion =
          "Please Select Option(s) for "
              + field.getPartialName()
              + " (you can select multiple options with CTRL)";
    } else {
      fieldQuestion = "Please Select an Option for " + field.getPartialName();
    }
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  }

  private static JSONObject createFieldJSONEntry(
      String fieldName,
      String fieldType,
      String fieldValueOptions,
      Object fieldDefaultValue,
      int fieldNumLines,
      String fieldQuestion) {
    JSONObject fieldJSON = new JSONObject();
    // Not Editable
    fieldJSON.put("fieldName", fieldName);
    fieldJSON.put("fieldType", fieldType);
    fieldJSON.put("fieldValueOptions", new JSONArray(fieldValueOptions));
    fieldJSON.put("fieldDefaultValue", fieldDefaultValue);
    fieldJSON.put("fieldNumLines", fieldNumLines);

    // Editable
    fieldJSON.put("fieldQuestion", fieldQuestion);
    fieldJSON.put("fieldMatchedDBVariable", "");
    fieldJSON.put("fieldMatchedDBName", "");

    return fieldJSON;
  }
}
