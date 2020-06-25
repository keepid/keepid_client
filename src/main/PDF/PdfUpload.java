package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.json.JSONObject;

public class PdfUpload {
  MongoDatabase db;

  public PdfUpload(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfUpload =
      ctx -> {
        String username = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        System.out.println(privilegeLevel);
        UploadedFile file = ctx.uploadedFile("file");
        // Different actions?
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
        JSONObject res = new JSONObject();
        if (pdfType == null) {
          res.put("status", "Invalid PDF Type");
        } else {
          if (file != null) {
            if (file.getContentType().equals("application/pdf")) {
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
              res.put("status", "Not PDF");
            }
          } else {
            res.put("status", "File is Null");
          }
        }
        ctx.json(res.toString());
      };
}
