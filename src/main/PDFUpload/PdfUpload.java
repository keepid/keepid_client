package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.bson.types.ObjectId;

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
        assert file != null;
        PdfMongo.upload(username, file.getFilename(), file.getContent(), this.db);
    };
}
