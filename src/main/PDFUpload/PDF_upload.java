package PDFUpload;
import java.io.File;
import io.javalin.core.util.FileUtil;
import io.javalin.http.Handler;

import javax.servlet.http.HttpServletRequest;

public class PDF_upload
{   public Handler pdf_upload = ctx -> {
        HttpServletRequest req = ctx.req;
        String username = req.getParameter("username");
        ctx.uploadedFiles("files").forEach(file -> {
            FileUtil.streamToFile(file.getContent(), "upload/" + username + file.getFilename());
            PDF_Mongo.upload(username, file.getFilename(), "upload/" + username + file.getFilename());
        });
    };
}
