package uploadTests;

import Config.MongoConfig;
import OrganizationIntTests.OrgEnrollmentStatus;
import OrganizationIntTests.OrganizationController;
import PDFUpload.PdfDownload;
import PDFUpload.PdfMongo;
import PDFUpload.PdfUpload;
import com.google.gson.JsonElement;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

public class UploadTests {
    private static MongoDatabase database;

    @BeforeAll
    static void setUp() {
        MongoConfig.startTestConnection();
        database = MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
    }
    @AfterAll
    public static void tearDown() {
        MongoConfig.closeTestConnection();
    }

    public static HashMap<String, String> loadExampleOrg1() {
        HashMap<String, String> exampleOrg1 = new HashMap<>();
        exampleOrg1.put("numUsers", "1000");
        return exampleOrg1;
    }

    @Test
    void listFiles() throws IOException {
        File initialFile = new File("CIS331_Final_Review.pdf");
        InputStream targetStream = new FileInputStream(initialFile);
        ObjectId id = PdfMongo.upload("James", "BlahBlah", targetStream, database);
        JSONArray files = PdfMongo.getAllFiles("test", database).getJSONArray("documents");
        for (Object j : files) {
            JSONObject js = (JSONObject) j;
            System.out.println(js);
        }
        InputStream inputStream = PdfMongo.download("James", new ObjectId(id.toString()), database);
        File file = new File("test.pdf");
        FileOutputStream outputStream = new FileOutputStream(file);
        int read;
        byte[] bytes = new byte[1024];

        while ((read = inputStream.read(bytes)) != -1) {
            outputStream.write(bytes, 0, read);
        }

    }
    /*@Test
    void signUpValidOrg() throws Exception {
        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse res = mock(HttpServletResponse.class);
        Context context = ContextUtil.init(req, res);
        Mockito.when(context.req.getInputStream()).thenReturn(Mockito.mock(ServletInputStream.class));
        JSONObject obj = new JSONObject(loadExampleOrg1());
        Mockito.when(context.body()).thenReturn(obj.toString());
        OrganizationController orgController = new OrganizationController(database);
        orgController.enrollOrganization.handle(context);
        assertEquals(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString(), context.resultString());
    }*/

}
