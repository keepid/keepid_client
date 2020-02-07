package PDFUpload;

import Config.MongoConfig;
import com.mongodb.Block;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.GridFSFindIterable;
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
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

public class PDF_Mongo {

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
    //Add option user
    public static List<String> getAllFiles(MongoDatabase db){
        List<String> files = new LinkedList<String>();
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);
            for (GridFSFile grid_out : gridBucket.find()){
                files.add(grid_out.getFilename());
            }
            return files;
        } catch (Exception e) {
            return files;
        }
    }
    //Add option user
    public static void download (String fileName, MongoDatabase db){
        System.out.println("Calling download...");
        try {
            GridFSBucket gridBucket = GridFSBuckets.create(db);

            FileOutputStream fileOutputStream = new FileOutputStream(fileName);
            gridBucket.downloadToStream(fileName, fileOutputStream);
            fileOutputStream.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

