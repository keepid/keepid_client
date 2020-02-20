package PDFUpload;

import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.json.JSONArray;
import org.json.JSONObject;

public class PdfSearch {
    private MongoDatabase db;
    public PdfSearch(MongoDatabase db){
        this.db=db;
    }
    public Handler pdfSearch =
            ctx -> {
                System.out.println("was called");
                String user = ctx.sessionAttribute("username");
                JSONObject files = PdfMongo.getAllFiles(user, db);
                System.out.print(files);
                ctx.json(files.toString());
            };

}
