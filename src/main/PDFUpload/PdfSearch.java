package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONArray;

public class PdfSearch {
    private MongoDatabase db;
    public PdfSearch(MongoDatabase db){
        this.db=db;
    }
    public Handler pdfSearch =
            ctx -> {
                String user = ctx.sessionAttribute("username");
                JSONArray files = PdfMongo.getAllFiles(user, db);
                ctx.json(files);
            };

}
