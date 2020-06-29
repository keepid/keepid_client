package PDF;

import User.UserType;
import Validation.ValidationUtils;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.LinkedList;
import java.util.List;

public class PdfController {
  private MongoDatabase db;

  public PdfController(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfDelete =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
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
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
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
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
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
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
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

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        pdfDocument.save(outputStream);
        pdfDocument.close();

        InputStream outputFileStream = new ByteArrayInputStream(outputStream.toByteArray());
        ctx.header("Content-Type", "application/pdf");
        ctx.result(outputFileStream);
      };

  // unused helper methods
  private String getFieldFullName(PDField field) {
    String fullName = field.getPartialName();
    while (field.getParent() != null) {
      field = field.getParent();
      fullName = field.getPartialName() + "." + fullName;
    }
    return fullName;
  }

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
