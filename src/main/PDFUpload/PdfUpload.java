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
        System.out.print("uploading");
        HttpServletRequest req = ctx.req;
        String username = ctx.sessionAttribute("username");
        UploadedFile file = ctx.uploadedFile("file");
        assert file != null;
        System.out.print(file.getContent());
        System.out.println("We got here, " + "upload/" + username + file.getFilename());
        ObjectId fileId = PdfMongo.upload(username, file.getFilename(), file.getContent(), this.db);
        /*
        FileUtil.streamToFile(file.getContent(), "upload/" + username + file.getFilename());
        ObjectId fileId =
            PDF_Mongo.upload(
                username, file.getFilename(), "upload/" + username + file.getFilename(), this.db);*/
        System.out.println("4 here" + fileId.toString());
    };
}
