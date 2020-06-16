package PDF;

import User.UserType;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Handler;
import org.bson.types.ObjectId;
import org.json.JSONObject;

public class PdfDelete {
  private MongoDatabase db;

  public PdfDelete(MongoDatabase db) {
    this.db = db;
  }

  public Handler pdfDelete =
      ctx -> {
        String user = ctx.sessionAttribute("username");
        String organizationName = ctx.sessionAttribute("orgName");
        UserType privilegeLevel = ctx.sessionAttribute("privilegeLevel");
        JSONObject req = new JSONObject(ctx.body());
        PDFType pdfType = PDFType.createFromString(req.getString("pdfType"));
        String fileIDStr = req.getString("fileId");
        System.out.println(fileIDStr);
        ObjectId fileID = new ObjectId(fileIDStr);
        JSONObject res =
            PdfMongo.delete(user, organizationName, pdfType, privilegeLevel, fileID, db);
        ctx.json(res.toString());
      };
}
