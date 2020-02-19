package PDFUpload;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import java.io.InputStream;

public class PdfDownload {
    private MongoDatabase db;
    public PdfDownload(MongoDatabase db){
        this.db = db;
    }
    public Handler pdfDownload = ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        ObjectId fileID = new ObjectId(req.getString("FileID"));
        InputStream targetStream = PdfMongo.download(fileID, db);
        //InputStream targetStream = new FileInputStream("CIS331_Final_Review.pdf");
        assert targetStream != null;
        ctx.result(targetStream);
    };
}
