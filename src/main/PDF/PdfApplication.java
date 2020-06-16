package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDNonTerminalField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
import org.bson.types.ObjectId;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.util.LinkedList;
import java.util.List;

public class PdfApplication {

  MongoDatabase db;

  public PdfApplication(MongoDatabase db) {
    this.db = db;
  }

  public static void main(String[] args) throws IOException {}

  public Handler getApplicationQuestions =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        // File pdfInput = new File("/home/steffen/Downloads/intellectual_property_release.pdf");
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        InputStream inputStream =
            PdfMongo.download(
                username, organizationName, privilegeLevel, applicationId, PDFType.FORM, db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        List<String> fieldNames = new LinkedList<String>();
        List<String> fieldQuestions = new LinkedList<String>();
        PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
        List<PDField> fields = acroForm.getFields();

        while (!fields.isEmpty()) {
          PDField field = fields.get(0);

          // If the field has a child
          if (field instanceof PDNonTerminalField) {
            List<PDField> childrenFields = ((PDNonTerminalField) field).getChildren();
            fields.addAll(childrenFields);
          } else {
            // fieldNames.add(getFieldFullName(field));
            fieldNames.add(field.getFullyQualifiedName());
            fieldQuestions.add("Please Enter Your " + field.getPartialName());
          }

          fields.remove(0);
        }

        for (String fieldName : fieldNames) {
          System.out.println(fieldName);
        }
        for (String fieldQuestion : fieldQuestions) {
          System.out.println(fieldQuestion);
        }

        pdfDocument.close();
        JSONObject res = new JSONObject();
        res.put("fieldNames", fieldNames);
        res.put("fieldQuestions", fieldQuestions);
        ctx.json(res.toString());
      };

  private String getFieldFullName(PDField field) {
    String fullName = field.getPartialName();
    while (field.getParent() != null) {
      field = field.getParent();
      fullName = field.getPartialName() + "." + fullName;
    }
    return fullName;
  }

  public Handler fillPDFForm =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId applicationId = new ObjectId(req.getString("applicationId"));
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject formAnswers = req.getJSONObject("formAnswers");

        // File pdfInput = new File("/home/steffen/Downloads/intellectual_property_release.pdf");
        InputStream inputStream =
            PdfMongo.download(
                username,
                organizationName,
                privilegeLevel,
                applicationId,
                PDFType.APPLICATION.FORM,
                db);
        PDDocument pdfDocument = PDDocument.load(inputStream);
        pdfDocument.setAllSecurityToBeRemoved(true);

        // ImportXFDF importXFDFObject = new ImportXFDF();
        // String xmlString = toXFDF(req);
        // InputStream stream = new
        // ByteArrayInputStream(xmlString.getBytes(StandardCharsets.UTF_8));
        // FDFDocument xfdfDocument = FDFDocument.loadXFDF(stream);
        // importXFDFObject.importFDF(pdfDocument, xfdfDocument);

        PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
        for (String key : formAnswers.keySet()) {
          String fieldName = key; // + "." + key;
          System.out.println(fieldName);
          PDField field = acroForm.getField(fieldName);
          if (field instanceof PDTextField) {
            System.out.println(field.getPartialName());
            String value = formAnswers.getString(key);
            field.setValue(value);
          }
        }

        // pdfDocument.save("/home/steffen/Downloads/test.pdf");
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfDocument.save(outputStream);
        pdfDocument.close();

        InputStream outputFileStream = new ByteArrayInputStream(outputStream.toByteArray());
        ctx.header("Content-Type", "application/pdf");
        ctx.result(outputFileStream);
      };

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
}
