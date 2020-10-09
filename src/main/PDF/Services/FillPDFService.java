package PDF.Services;

import Config.Message;
import Config.Service;
import PDF.PdfMessage;
import User.UserType;
import com.mongodb.client.MongoDatabase;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.json.JSONObject;
import org.slf4j.Logger;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

public class FillPDFService implements Service {
  UserType privilegeLevel;
  InputStream fileStream;
  JSONObject formAnswers;
  InputStream completedForm;
  MongoDatabase db;
  Logger logger;

  public FillPDFService(
      MongoDatabase db,
      Logger logger,
      UserType privilegeLevel,
      InputStream fileStream,
      JSONObject formAnswers) {
    this.db = db;
    this.logger = logger;
    this.privilegeLevel = privilegeLevel;
    this.fileStream = fileStream;
    this.formAnswers = formAnswers;
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
          completedForm = fillFields(fileStream, formAnswers);
        } catch (IOException e) {
          return PdfMessage.SERVER_ERROR;
        }
      } else {
        return PdfMessage.INSUFFICIENT_PRIVILEGE;
      }
      return PdfMessage.SUCCESS;
    }
  }

  public InputStream getCompletedForm() {
    Objects.requireNonNull(completedForm);
    return completedForm;
  }

  public static InputStream fillFields(InputStream inputStream, JSONObject formAnswers)
      throws IllegalArgumentException, IOException {
    if (inputStream == null || formAnswers == null) {
      throw new IllegalArgumentException();
    }
    PDDocument pdfDocument = PDDocument.load(inputStream);
    pdfDocument.setAllSecurityToBeRemoved(true);
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    if (acroForm == null) {
      throw new IllegalArgumentException();
    }
    for (String fieldName : formAnswers.keySet()) {
      System.out.println(fieldName);
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
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    pdfDocument.save(outputStream);
    pdfDocument.close();

    return new ByteArrayInputStream(outputStream.toByteArray());
  }
}
