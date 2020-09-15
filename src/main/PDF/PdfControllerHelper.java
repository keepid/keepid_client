package PDF;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureOptions;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.visible.PDVisibleSigProperties;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.visible.PDVisibleSignDesigner;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.LinkedList;
import java.util.List;

public class PdfControllerHelper {
  public static final int DEFAULT_TEXT_FIELD_NUM_LINES = 3;
  public static final int DEFAULT_SIGNATURE_FIELD_NUM_LINES = 4;
  public static final int DEFAULT_PUSH_BUTTON_NUM_LINES = 3;
  public static final int DEFAULT_CHECK_BOX_NUM_LINES = 3;

  public static InputStream signPDF(
      String username, InputStream pdfInputStream, InputStream imageInputStream)
      throws IOException {
    PDDocument pdfDocument = PDDocument.load(pdfInputStream);

    PDVisibleSignDesigner visibleSignDesigner = new PDVisibleSignDesigner(imageInputStream);
    visibleSignDesigner.zoom(0);
    PDVisibleSigProperties visibleSigProperties =
        new PDVisibleSigProperties()
            .visualSignEnabled(true)
            .setPdVisibleSignature(visibleSignDesigner);
    visibleSigProperties.buildSignature();

    SignatureOptions signatureOptions = new SignatureOptions();
    signatureOptions.setVisualSignature(visibleSigProperties.getVisibleSignature());

    PDSignature signature = new PDSignature();
    signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
    signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
    signature.setName(username);
    signature.setSignDate(Calendar.getInstance());

    for (PDSignatureField signatureField : findSignatureFields(pdfDocument)) {
      signatureField.setValue(signature);
    }

    pdfDocument.addSignature(signature, signatureOptions);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    pdfDocument.save(outputStream);
    pdfDocument.close();

    return new ByteArrayInputStream(outputStream.toByteArray());
  }

  // Make it so that it can handle different signers
  public static List<PDSignatureField> findSignatureFields(PDDocument pdfDocument) {
    List<PDSignatureField> signatureFields = new LinkedList<>();
    List<PDField> fields = new LinkedList<>();
    fields.addAll(pdfDocument.getDocumentCatalog().getAcroForm().getFields());
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        if (field instanceof PDSignatureField) {
          signatureFields.add((PDSignatureField) field);
        }
      }

      // Remove field just gotten so we do not get it again
      fields.remove(0);
    }
    return signatureFields;
  }

  /*
   @Param fieldsJSON is an empty List of JSON, pdfDocument is the document
  */
  public static List<JSONObject> getFieldInformation(PDDocument pdfDocument) {
    if (pdfDocument == null) {
      throw new IllegalArgumentException();
    }
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
    return fieldsJSON;
  }

  public static JSONObject getTextField(PDTextField field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "TextField";
    String fieldValueOptions = "[]";
    String fieldDefaultValue = "";
    int numLines = DEFAULT_TEXT_FIELD_NUM_LINES;
    String fieldQuestion = "Please Enter Your " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  }

  public static JSONObject getCheckBox(PDCheckBox field) {
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

  public static JSONObject getPushButton(PDPushButton field) {
    String fieldName = field.getFullyQualifiedName();
    String fieldType = "PushButton";
    String fieldValueOptions = "[]";
    String fieldDefaultValue = "";
    int numLines = DEFAULT_PUSH_BUTTON_NUM_LINES;
    String fieldQuestion = "Select the Button If You Want To " + field.getPartialName();
    return createFieldJSONEntry(
        fieldName, fieldType, fieldValueOptions, fieldDefaultValue, numLines, fieldQuestion);
  }

  public static JSONObject getRadioButton(PDRadioButton field) {
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

  public static JSONObject getChoiceField(PDChoice field) {
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

  public static JSONObject createFieldJSONEntry(
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

  public static void fillFields(PDDocument pdfDocument, JSONObject formAnswers)
      throws IllegalArgumentException, IOException {
    if (pdfDocument == null || formAnswers == null) {
      throw new IllegalArgumentException();
    }

    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    if (acroForm == null) {
      throw new IllegalArgumentException();
    }
    for (String fieldName : formAnswers.keySet()) {
      PDField field = acroForm.getField(fieldName);
      if (field instanceof PDButton) {
        if (field instanceof PDCheckBox) {
          PDCheckBox checkBoxField = (PDCheckBox) field;
          boolean formAnswer = formAnswers.getBoolean(fieldName);
          if (formAnswer) {
            checkBoxField.check();
          } else {
            checkBoxField.unCheck();
          }
        } else if (field instanceof PDPushButton) {
          // Do nothing. Maybe in the future make it clickable
        } else if (field instanceof PDRadioButton) {

          PDRadioButton radioButtonField = (PDRadioButton) field;
          String formAnswer = formAnswers.getString(fieldName);
          radioButtonField.setValue(formAnswer);
        }
      } else if (field instanceof PDVariableText) {
        if (field instanceof PDChoice) {
          if (field instanceof PDListBox) {
            PDListBox listBoxField = (PDListBox) field;
            List<String> values = new LinkedList<>();

            // Test that this throws an error when invalid values are passed
            for (Object value : formAnswers.getJSONArray(fieldName)) {
              String stringValue = (String) value;
              values.add(stringValue);
            }
            listBoxField.setValue(values);
          } else if (field instanceof PDComboBox) {
            PDComboBox listBoxField = (PDComboBox) field;
            String formAnswer = formAnswers.getString(fieldName);
            listBoxField.setValue(formAnswer);
          }
        } else if (field instanceof PDTextField) {
          String value = formAnswers.getString(fieldName);
          field.setValue(value);
        }
      } else if (field instanceof PDSignatureField) {
        // Do nothing, implemented separately in pdfSignedUpload
      }
    }
  }

  public static JSONObject getFieldValues(PDDocument pdfDocument) throws IOException {
    JSONObject fieldValues = new JSONObject();
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    List<PDField> fields = new LinkedList<>();
    fields.addAll(acroForm.getFields());
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        fieldValues.put(field.getFullyQualifiedName(), field.getValueAsString());
      }

      // Delete field just gotten so we do not infinite recurse
      fields.remove(0);
    }
    return fieldValues;
  }
}
