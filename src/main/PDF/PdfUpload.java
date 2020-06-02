package PDF;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.bson.types.ObjectId;
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
        String privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        UploadedFile file = ctx.uploadedFile("file");
        // Different actions?
        PDFType pdfType = PDFType.createFromString(ctx.formParam("pdfType"));
        JSONObject res = new JSONObject();
        if (pdfType == null) {
          res.put("status", "Invalid PDF Type");
        } else if (pdfType == PDFType.FORM
            && !(privilegeLevel.equals("Director") || privilegeLevel.equals("Admin"))) {
          res.put("status", "Non-Admin Cannot Create Form");
        } else {
          if (file != null) {
            if (file.getContentType().equals("application/pdf")) {
              String uploader;
              if (pdfType == PDFType.FORM) {
                uploader = organizationName;
              } else {
                uploader = username;
              }
              ObjectId out =
                  PdfMongo.upload(
                      uploader, file.getFilename(), pdfType, file.getContent(), this.db);
              System.out.println(out.toString());
              res.put("status", "success");
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
