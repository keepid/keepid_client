package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.types.ObjectId;

import java.io.InputStream;

public class PdfDownload {
  private MongoDatabase db;

  public PdfDownload(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfDownload =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String fileIDStr = ctx.pathParam("fileID");
        System.out.println(fileIDStr);
        ObjectId fileID = new ObjectId(fileIDStr);
        InputStream targetStream = PdfMongo.download(user, fileID, db);
        if (targetStream != null) {
          ctx.header("Content-Type", "application/pdf");
          ctx.result(targetStream);
        } else {
          ctx.result("Error");
        }
      };
}
