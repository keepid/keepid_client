package PDF;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;

public class PdfSearch {
  private MongoDatabase db;

  public PdfSearch(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfSearch =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        if (pdfType == null) {
          ctx.json("Error!");
        } else if (pdfType == PDFType.FORM) {
          JSONObject fileDescriptions = PdfMongo.getAllFiles(organizationName, pdfType, db);
          ctx.json(fileDescriptions.toString());
        } else {
          JSONObject fileDescriptions = PdfMongo.getAllFiles(user, pdfType, db);
          ctx.json(fileDescriptions.toString());
        }
      };
}
