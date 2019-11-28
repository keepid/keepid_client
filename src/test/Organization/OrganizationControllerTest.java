package Organization;

import com.github.fakemongo.Fongo;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrganizationControllerTest {

    @BeforeEach
    void setUp() {
        Fongo fongo = new Fongo("Fongo Server");
    }

    @Test
    void signUpValidOrg() throws IOException {

        HttpServletRequest req = mock(HttpServletRequest.class);

        Mockito.when(req.getInputStream()).thenReturn(Mockito.mock(ServletInputStream.class));
        Mockito.when(req.getParameter("firstname")).thenReturn("fname");
        Mockito.when(req.getParameter("lastname")).thenReturn("lname");
        Mockito.when(req.getParameter("birthdate")).thenReturn("1/1/2000");
        Mockito.when(req.getParameter("email")).thenReturn("xxx@xxx.com");
        Mockito.when(req.getParameter("password")).thenReturn("badpassword");
        Mockito.when(req.getParameter("orgName")).thenReturn("nameoforg");

        HttpServletResponse res = mock(HttpServletResponse.class);

        Context ctx = ContextUtil.init(req, res);

        try {
            OrganizationController.enrollOrganization.handle(ctx);
            //verify(ctx).json(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT);
        } catch (Exception e) {
            fail("Exception thrown.");
        }
    }

    @AfterEach
    void tearDown() {
    }
}