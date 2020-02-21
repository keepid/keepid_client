package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;

public class PdfUpload {
  MongoDatabase db;

  public PdfUpload(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfUpload =
      ctx -> {
        HttpServletRequest req = ctx.req;
        String username = ctx.sessionAttribute("privilegeLevel");
        System.out.println("Username: " + username);
        UploadedFile file = ctx.uploadedFile("file");
        JSONObject res = new JSONObject();
        if (file != null) {
          ObjectId out = PdfMongo.upload(username, file.getFilename(), file.getContent(), this.db);
          if (out != null) {
            res.put("status", "success");
          } else {
            res.put("status", "failure");
          }
        } else {
          res.put("status", "failure");
        }
        ctx.json(res.toString());
      };
}
