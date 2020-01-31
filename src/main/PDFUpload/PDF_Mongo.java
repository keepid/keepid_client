package PDFUpload;

import Config.MongoConfig;
import com.mongodb.Block;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.GridFSUploadStream;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import io.github.cdimascio.dotenv.Dotenv;
import org.bson.BSON;
import org.bson.BsonValue;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.io.*;
import java.nio.file.Files;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Objects;

class PDF_Mongo {

    static ObjectId upload (String user, String title, String path, MongoDatabase db) {
        System.out.println("Calling upload...");
        ObjectId fileId = null;
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);
            InputStream inputStream = new FileInputStream(new File(path));
            System.out.println("2 here");
            GridFSUploadOptions options = new GridFSUploadOptions()
                    .chunkSizeBytes(1024)
                    .metadata(new Document("type", "pdf")
                            .append("upload_date", String.valueOf(LocalDate.now()))
                            .append("uploader", user));
            System.out.println("3 here");
            fileId = gridBucket.uploadFromStream(title, inputStream, options);
            gridBucket.find().forEach(
                    new Block<GridFSFile>() {
                        public void apply(final GridFSFile gridFSFile) {
                            System.out.println(gridFSFile.getFilename());
                        }
                    });

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return fileId;
    }
    void download (String fileName, MongoDatabase db){
        System.out.println("Calling download...");
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);

            FileOutputStream fileOutputStream = new FileOutputStream("/download/" + fileName);
            gridBucket.downloadToStream(fileName, fileOutputStream);
            fileOutputStream.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

