package PDFUpload;

import Config.MongoConfig;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.GridFSUploadStream;
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

    static ObjectId upload (String user, String title, String path){
        System.out.println("Calling upload...");
        MongoClient mongoClient = new MongoClient(new MongoClientURI(Objects.requireNonNull(Dotenv.load().get("MONGO_URI"))));
        ObjectId fileId = null;
        try {
            MongoDatabase database = mongoClient.getDatabase(MongoConfig.getDatabaseName());
            GridFSBucket gridBucket = GridFSBuckets.create(database);
            InputStream inputStream = new FileInputStream(new File(path));
            GridFSUploadOptions options = new GridFSUploadOptions()
                    .chunkSizeBytes(1024)
                    .metadata(new Document("type", "pdf")
                            .append("upload_date", String.valueOf(LocalDate.now()))
                            .append("uploader", user));
            fileId = gridBucket.uploadFromStream(title, inputStream, options);

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        finally {
            mongoClient.close();
        }
        return fileId;


    }
    void download (String fileName){
        System.out.println("Calling download...");
        MongoClient mongoClient = new MongoClient(new MongoClientURI(Objects.requireNonNull(Dotenv.load().get("MONGO_URI"))));

        try {
            MongoDatabase database = mongoClient.getDatabase(MongoConfig.getDatabaseName());
            GridFSBucket gridBucket = GridFSBuckets.create(database);

            FileOutputStream fileOutputStream = new FileOutputStream("/download/" + fileName);
            gridBucket.downloadToStream(fileName, fileOutputStream);
            fileOutputStream.close();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            mongoClient.close();
        }
    }

}
}
