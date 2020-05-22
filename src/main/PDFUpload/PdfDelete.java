package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.types.ObjectId;
import org.json.JSONObject;

public class PdfDelete {
  private MongoDatabase db;

  public PdfDelete(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfDelete =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String fileIDStr = ctx.pathParam("fileId");
        System.out.println(fileIDStr);
        ObjectId fileID = new ObjectId(fileIDStr);
        Boolean success = PdfMongo.delete(user, fileID, db);
        JSONObject res = new JSONObject();
        if (success) {
          res.put("status", "success");
        } else {
          res.put("status", "failure");
        }
        ctx.json(res.toString());
      };
}
