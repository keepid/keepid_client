package PDF;

import User.UserType;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

public class PdfController {
  private MongoDatabase db;

  public PdfController(MongoDatabase db) {
    this.db = db;
  }

  public static Set<String> validFieldTypes =
      new HashSet<>(
          Arrays.asList(
              "CheckBox",
              "PushButton",
              "RadioButton",
              "ComboBox",
              "ListBox",
              "TextField",
              "SignatureField"));

  public Handler pdfDelete =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        PdfType pdfType = PdfType.createFromString(req.getString("pdfType"));
        String fileIDStr = req.getString("fileId");
        if (!ValidationUtils.isValidObjectId(fileIDStr) || pdfType == null) {
          ctx.json(PdfMessage.INVALID_PARAMETER.toJSON());
          return;
        }
        ObjectId fileID = new ObjectId(fileIDStr);
        JSONObject res =
            PdfMongo.delete(user, organizationName, pdfType, privilegeLevel, fileID, db);
        ctx.json(res.toString());
      };

  public Handler pdfDownload =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        String fileIDStr = req.getString("fileID");
        PdfType pdfType = PdfType.createFromString(req.getString("pdfType"));
        ObjectId fileID = new ObjectId(fileIDStr);
        if (pdfType == null) {
          ctx.result("Invalid PDFType");
        } else {
          InputStream stream =
              PdfMongo.download(user, organizationName, privilegeLevel, fileID, pdfType, db);
          if (stream != null) {
            ctx.header("Content-Type", "application/pdf");
            ctx.result(stream);
          } else {
            ctx.result("Error");
          }
        }
      };
  public Handler pdfGetAll =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        PdfType pdfType = PdfType.createFromString(req.getString("pdfType"));
        JSONObject res = new JSONObject();

        if (pdfType == null) {
          res.put("status", "Invalid PDFType");
        } else {
          res = PdfMongo.getAllFiles(user, organizationName, privilegeLevel, pdfType, db);
        }
        ctx.json(res.toString());
      };

  public Handler pdfUpload =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        UploadedFile file = ctx.uploadedFile("file");
        PdfType pdfType = PdfType.createFromString(ctx.formParam("pdfType"));
        JSONObject res;
        if (pdfType == null) {
          res = PdfMessage.INVALID_PDF_TYPE.toJSON();
        } else if (file == null) {
          res = PdfMessage.INVALID_PDF.toJSON();
        } else if (file.getContentType().equals("application/pdf")
            || (file.getContentType().equals("application/octet-stream"))) {
          res =
              PdfMongo.upload(
                  username,
                  organizationName,
                  privilegeLevel,
                  file.getFilename(),
                  pdfType,
                  file.getContent(),
                  this.db);
        } else {
          res = PdfMessage.INVALID_PDF.toJSON();
        }
        ctx.json(res.toString());
      };

  public Handler getApplicationQuestions =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        InputStream inputStream =
            PdfMongo.download(
                username, organizationName, privilegeLevel, applicationId, PdfType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        List<JSONObject> fieldsJSON = new LinkedList<>();
        getFieldInformation(pdfDocument, fieldsJSON);
        pdfDocument.close();

        ctx.json(fieldsJSON);
      };

  /*
   @Param fieldsJSON is an empty List of JSON, pdfDocument is the document
  */
  public static void getFieldInformation(PDDocument pdfDocument, List<JSONObject> fieldsJSON) {
    if (pdfDocument == null || fieldsJSON == null) {
      throw new IllegalArgumentException();
    }

    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    List<PDField> fields = acroForm.getFields();
    while (!fields.isEmpty()) {
      PDField field = fields.get(0);
      if (field instanceof PDNonTerminalField) {
        // If the field has children
        List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
        fields.addAll(childrenFields);
      } else {
        JSONObject fieldJSON = new JSONObject();
        String fieldType = "";
        String fieldValueOptions = "[]";
        if (field instanceof PDButton) {
          if (field instanceof PDCheckBox) {
            fieldType = "CheckBox";
          } else if (field instanceof PDPushButton) {
            fieldType = "PushButton";
          } else if (field instanceof PDRadioButton) {
            fieldType = "RadioButton";
            PDRadioButton radioButtonField = (PDRadioButton) field;
            JSONArray optionsJSONArray = new JSONArray();
            for (String choice : radioButtonField.getOnValues()) {
              optionsJSONArray.put(choice);
            }
            fieldValueOptions = optionsJSONArray.toString();
          }
        } else if (field instanceof PDVariableText) {
          if (field instanceof PDChoice) {
            if (field instanceof PDComboBox) {
              fieldType = "ComboBox";
            } else if (field instanceof PDListBox) {
              fieldType = "ListBox";
            }
            PDChoice choiceField = (PDChoice) field;
            JSONArray optionsJSONArray = new JSONArray();
            for (String choice : choiceField.getOptions()) {
              optionsJSONArray.put(choice);
            }
            fieldValueOptions = optionsJSONArray.toString();
          } else if (field instanceof PDTextField) {
            fieldType = "TextField";
          }
        } else if (field instanceof PDSignatureField) {
          fieldType = "SignatureField";
        }

        // Not Editable
        fieldJSON.put("fieldName", field.getFullyQualifiedName());
        fieldJSON.put("fieldType", fieldType);
        fieldJSON.put("fieldValueOptions", fieldValueOptions);

        // Editable
        fieldJSON.put("fieldQuestion", "Please Enter Your " + field.getPartialName());
        fieldJSON.put("fieldMatchedDBVariable", "");
        fieldJSON.put("fieldMatchedDBName", "");

        fieldsJSON.add(fieldJSON);
      }

      // Delete field just gotten so we do not infinite recurse
      fields.remove(0);
    }
  }

  public Handler fillPDFForm =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject formAnswers = req.getJSONObject("formAnswers");

        InputStream inputStream =
            PdfMongo.download(
                username, organizationName, privilegeLevel, applicationId, PdfType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        try {
          fillFields(pdfDocument, formAnswers);
        } catch (IOException exception) {
          ctx.result("failure");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfDocument.save(outputStream);
        pdfDocument.close();

        InputStream outputFileStream = new ByteArrayInputStream(outputStream.toByteArray());
        ctx.header("Content-Type", "application/pdf");
        ctx.result(outputFileStream);
      };

  public static void fillFields(PDDocument pdfDocument, JSONObject formAnswers)
      throws IllegalArgumentException, IOException {
    if (pdfDocument == null || formAnswers == null) {
      throw new IllegalArgumentException();
    }

    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
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
            PDListBox comboBoxField = (PDListBox) field;
            List<String> values = new LinkedList<>();

            // Test that this throws an error when invalid values are passed
            for (Object value : formAnswers.getJSONArray(fieldName)) {
              String stringValue = (String) value;
              values.add(stringValue);
            }
            comboBoxField.setValue(values);
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
        // Do nothing
      }
    }
  }

  public static JSONObject getFieldValues(PDDocument pdfDocument) throws IOException {
    JSONObject fieldValues = new JSONObject();
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    List<PDField> fields = acroForm.getFields();
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

  /*
  // ImportXFDF importXFDFObject = new ImportXFDF();
  // String xmlString = toXFDF(req);
  // InputStream stream = new
  // ByteArrayInputStream(xmlString.getBytes(StandardCharsets.UTF_8));
  // FDFDocument xfdfDocument = FDFDocument.loadXFDF(stream);
  // importXFDFObject.importFDF(pdfDocument, xfdfDocument);

  private String toXFDF(JSONObject req)
      throws ParserConfigurationException, TransformerConfigurationException, TransformerException {
    DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
    DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
    Document doc = dBuilder.newDocument();
    Element rootElement = doc.createElement("xfdf");
    rootElement.setAttribute("xmlns", "http://ns.adobe.com/xfdf");
    rootElement.setAttribute("xml:space", "preserve");
    doc.appendChild(rootElement);
    Element fields = doc.createElement("fields");
    rootElement.appendChild(fields);

    for (String key : req.keySet()) {
      Element field = doc.createElement("field");
      field.setAttribute("name", key);
      fields.appendChild(field);

      Element value = doc.createElement("value");
      value.setTextContent(req.getString(key));
      field.appendChild(value);
    }

    TransformerFactory transformerFactory = TransformerFactory.newInstance();
    Transformer transformer = transformerFactory.newTransformer();
    DOMSource domSource = new DOMSource(doc);
    StringWriter stringWriter = new StringWriter();
    StreamResult streamResult = new StreamResult(stringWriter);

    transformer.transform(domSource, streamResult);
    String xmlString = stringWriter.toString();
    return (xmlString);
  }
   */
}
