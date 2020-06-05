package PDF;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.tools.ImportXFDF;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import java.io.File;
import java.io.IOException;

public class PdfApplication {

  MongoDatabase db;

  public PdfApplication(MongoDatabase db) {
    this.db = db;
  }

  public static void main(String[] args) throws IOException {}

  public Handler fillPDFForm =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        for (String key : req.keySet()) {
          System.out.println(key);
        }

        File pdfInput = new File("/home/steffen/Downloads/ss-5(1).pdf");
        PDDocument pdfDocument = PDDocument.load(pdfInput);
        pdfDocument.setAllSecurityToBeRemoved(true);

        pdfDocument.addPage(new PDPage());
        ImportXFDF importXFDF = new ImportXFDF();

        pdfDocument.save("/home/steffen/Downloads/ss-5_3.pdf");
        pdfDocument.close();

        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.newDocument();

        Element rootElement = doc.createElement("xfdf");
        doc.appendChild(rootElement);

        Element value = doc.createElement("");
        value.appendChild(doc.createTextNode(""));
        rootElement.appendChild(value);

        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource domSource = new DOMSource(doc);
        domSource.toString();
        // transformer.transform(domSource, new OutputStream())
        // Result result = new Result();
      };
}
