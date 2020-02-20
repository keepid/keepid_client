package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.core.util.FileUtil;
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
        String username = ctx.sessionAttribute("username");
        System.out.println("Username: " + username);
        UploadedFile file = ctx.uploadedFile("file");
        System.out.println(file.getContentType());
        JSONObject res = new JSONObject();
        //if (file.getContentType() != pdf);
        //test more with server failures
        if (file != null) {
            if (file.getContentType().equals("application/pdf")) {
                ObjectId out = PdfMongo.upload(username, file.getFilename(), file.getContent(), this.db);
                System.out.println(out.toString());
                if (out != null) {
                    res.put("status", "success");
                }
                else {
                    res.put("status", "failure");
                }
            }
            else {
                res.put("status", "failure");
            }
        }
        else {
            res.put("status", "failure");
        }
        ctx.json(res.toString());
    };
}
