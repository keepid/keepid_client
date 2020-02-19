package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONArray;

public class PdfSearch {
    MongoDatabase db;
    public PdfSearch(MongoDatabase db){
        this.db=db;
    }
    public Handler pdfSearch =
            ctx -> {
                String user = "woow"; //Sessions
                JSONArray files = PdfMongo.getAllFiles(user, db);
                ctx.json(files);
            };

}
