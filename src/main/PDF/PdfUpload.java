package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.json.JSONObject;

import java.util.Objects;

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
        UploadedFile file = ctx.uploadedFile("file");
        PDFType pdfType =
            PDFType.createFromString(Objects.requireNonNull(ctx.formParam("pdfType")));
        JSONObject res;
        if (pdfType == null) {
          res = PdfMessage.INVALID_PDF_TYPE.toJSON();
        } else {
          if (file != null) {
            if (file.getContentType().equals("application/pdf")
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
          } else {
            res = PdfMessage.INVALID_PDF.toJSON();
          }
        }
        ctx.json(res.toString());
      };
}
