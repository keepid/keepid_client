package PDFUpload;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import java.io.FileInputStream;
import java.io.InputStream;

public class PDF_dowload {
    MongoDatabase db;
    public PDF_dowload(MongoDatabase db){
        this.db = db;
    }
    public Handler pdf_dowload = ctx -> {
        //JSONObject req = new JSONObject(ctx.body());
        //String fileID = req.getString("FileID");
        PDF_Mongo.download("CIS331_Final_Review.pdf", db);
        //File initialFile = new File("/download/" + fileID);
        InputStream targetStream = new FileInputStream("CIS331_Final_Review.pdf");
        ctx.result(targetStream);
    };
}
