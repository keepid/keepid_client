package PDFUpload;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONObject;

import java.io.FileInputStream;
import java.io.InputStream;

public class PDF_dowload {
    MongoDatabase db;
    public PDF_dowload(MongoDatabase db){
        this.db = db;
    }
    public Handler pdf_dowload = ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String fileName = req.getString("FileName");
        String fileID = req.getString("FileID");
        InputStream targetStream = PDF_Mongo.download("fileID.pdf", db);
        //InputStream targetStream = new FileInputStream("CIS331_Final_Review.pdf");
        assert targetStream != null;
        ctx.result(targetStream);
    };
}
