package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import java.io.InputStream;

public class PdfDownload {
  private MongoDatabase db;

  public PdfDownload(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfDownload =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        JSONObject req = new JSONObject(ctx.body());
        String fileIDStr = req.getString("fileID");
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        System.out.println(fileIDStr);
        ObjectId fileID = new ObjectId(fileIDStr);
        if (pdfType == null) {
          ctx.result("Invalid PDFType");
        } else {
          InputStream targetStream;
          if (pdfType == PDFType.FORM) {
            targetStream = PdfMongo.download(organizationName, fileID, pdfType, db);
          } else {
            targetStream = PdfMongo.download(user, fileID, pdfType, db);
          }
          if (targetStream != null) {
            ctx.header("Content-Type", "application/pdf");
            ctx.result(targetStream);
          } else {
            ctx.result("Error");
          }
        }
      };
}
