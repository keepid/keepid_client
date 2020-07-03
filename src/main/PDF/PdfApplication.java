package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
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

public class PdfApplication {

  MongoDatabase db;

  public PdfApplication(MongoDatabase db) {
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

  public Handler getApplicationQuestions =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        InputStream inputStream =
            PdfMongo.download(
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
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
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
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

  public static void fillFields(PDDocument pdfDocument, JSONObject formAnswers) throws IOException {
    PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
    for (String fieldName : formAnswers.keySet()) {
      System.out.println(fieldName);
      PDField field = acroForm.getField(fieldName);
      if (field instanceof PDTextField) {
        System.out.println(field.getPartialName());
        String value = formAnswers.getString(fieldName);
        field.setValue(value);
      }
    }
  }

  /*
  private String getFieldFullName(PDField field) {
    String fullName = field.getPartialName();
    while (field.getParent() != null) {
      field = field.getParent();
      fullName = field.getPartialName() + "." + fullName;
    }
    return fullName;
  }
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
