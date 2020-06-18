package PDF;

import User.UserType;
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
}
