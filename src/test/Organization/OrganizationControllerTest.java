package Organization;

import Config.MongoConfig;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;
import org.bson.Document;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrganizationControllerTest {
    private static MongoDatabase database;

    @BeforeAll
    static void setUp() {
        MongoConfig.startTestConnection();
        database = MongoConfig.getMongoTestClient().getDatabase(MongoConfig.getDatabaseName());
    }

    @Test // test creating a valid organization
    void signUpValidOrg() throws Exception {
        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse res = mock(HttpServletResponse.class);
        Context context = ContextUtil.init(req, res);
        Mockito.when(context.req.getInputStream()).thenReturn(Mockito.mock(ServletInputStream.class));
        // load all params
        HashMap<String,String> exampleOrgLoad1 = loadExampleOrg1();
        for(HashMap.Entry<String, String> entry : exampleOrgLoad1.entrySet()){
            Mockito.when(context.req.getParameter(entry.getKey())).thenReturn(entry.getValue());
        }
        when(context.req.getParameterMap()).thenReturn(loadExampleParamMapOrg1());
        OrganizationController orgController = new OrganizationController(database);
        orgController.enrollOrganization.handle(context);
        assertEquals(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString(), context.resultString());
    }

    @Test// test creating a valid organization
    void signUpInValidOrgMissingName() throws Exception {
        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse res = mock(HttpServletResponse.class);
        Context context = ContextUtil.init(req, res);
        Mockito.when(context.req.getInputStream()).thenReturn(Mockito.mock(ServletInputStream.class));
        // load all params except orgname
        HashMap<String,String> exampleOrgLoad1 = loadExampleOrg1();
        Map<String, String[]> exampleParamMap = loadExampleParamMapOrg1();
        exampleOrgLoad1.put("orgName", null);
        exampleParamMap.put("orgName", new String[] {null});
        for(HashMap.Entry<String, String> entry : exampleOrgLoad1.entrySet()){
            Mockito.when(context.req.getParameter(entry.getKey())).thenReturn(entry.getValue());
        }
        when(context.req.getParameterMap()).thenReturn(exampleParamMap);
        OrganizationController orgController = new OrganizationController(database);
        orgController.enrollOrganization.handle(context);
        assertEquals(OrgEnrollmentStatus.FIELD_EMPTY.toString(), context.resultString());
    }

    // all the tests i want to make
    // create empty org
    // recreate all error exceptions- check validation
    // create org with existing information
    //


    @AfterEach
    public void resetDB() {
        MongoConfig.cleanTestDatabase();
    }

    @AfterAll
    public static void tearDown() {
        MongoConfig.closeTestConnection();
    }
    public static HashMap<String, String> loadExampleOrg1() {
        HashMap<String, String> exampleOrg1 = new HashMap<String, String>();
        exampleOrg1.put("orgName", "exampleOrgName1");
        exampleOrg1.put("orgWebsite", "exampleOrgWebsite1");
        exampleOrg1.put("name", "adminNameHere");
        exampleOrg1.put("username", "adminNameHere");
        exampleOrg1.put("password", "adminPasswordHere");
        exampleOrg1.put("phone", "1110001111");
        exampleOrg1.put("email", "exampleOrg1@example.com");
        exampleOrg1.put("city", "philadelphia");
        exampleOrg1.put("state", "PA");
        exampleOrg1.put("address", "exampleAddress");
        exampleOrg1.put("zipcode", "19104");
        exampleOrg1.put("taxCode", "501c3");
        exampleOrg1.put("numUsers", "1000");
        return exampleOrg1;
    }

    Map<String, String[]> loadExampleParamMapOrg1() {
        HashMap<String, String> map = loadExampleOrg1();
        Map<String, String[]> paramMap = new HashMap<String, String[]>();
        for(HashMap.Entry<String, String> entry : map.entrySet()){
            paramMap.put(entry.getKey(), new String[] {entry.getValue()});
        }
        return paramMap;
    }
}