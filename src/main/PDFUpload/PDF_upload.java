package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.core.util.FileUtil;
import io.javalin.http.Handler;
import io.javalin.http.UploadedFile;
import org.bson.types.ObjectId;

import javax.servlet.http.HttpServletRequest;

public class PDF_upload {
  MongoDatabase db;

  public PDF_upload(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdf_upload =
      ctx -> {
        HttpServletRequest req = ctx.req;
<<<<<<< HEAD
        String username = "test";//req.getParameter("name")
        UploadedFile file = ctx.uploadedFile("file");
=======
        String username = "test"; // req.getParameter("name");
        // Files.writeString(Paths.get("hello.pdf"), ctx.body());
        System.out.println("We are here");
        // System.out.println("This is a print statment" + ctx.body());
        // String file2 = ctx.body();
        UploadedFile file = ctx.uploadedFile("file");
        System.out.println("now we here");
        // UploadedFile file = ctx.uploadedFile("file");
        // System.out.println("We here" + ctx.body());
        // System.out.println(ctx.body().length());
>>>>>>> aebdcc8d8bd97e74efa599226898af47bbc0cf3a
        assert file != null;
        System.out.print(file.getContent());
        System.out.println("We got here, " + "upload/" + username + file.getFilename());
        FileUtil.streamToFile(file.getContent(), "upload/" + username + file.getFilename());
        ObjectId fileId =
            PDF_Mongo.upload(
                username, file.getFilename(), "upload/" + username + file.getFilename(), this.db);
        System.out.println("4 here" + fileId.toString());
<<<<<<< HEAD
    };

=======
      };
>>>>>>> aebdcc8d8bd97e74efa599226898af47bbc0cf3a
}
