package Organization;

import static com.mongodb.client.model.Filters.eq;

import User.UserMessage;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import javax.servlet.http.HttpServletRequest;
import org.bson.Document;

public class OrganizationController {

    MongoDatabase db;

    public OrganizationController(MongoDatabase db) {
        this.db = db;
    }

    public Handler enrollOrganization = ctx -> {
        HttpServletRequest req = ctx.req;
        if (!OrganizationValidation.isValidOrg(req, ctx)) {
            return;
        }
        String orgName = req.getParameter("orgName");
        String orgWebsite = req.getParameter("orgWebsite").toLowerCase();
        String adminName = req.getParameter("name").toLowerCase();
        String orgContactPhoneNumber = req.getParameter("phone").toLowerCase();
        String email = req.getParameter("email").toLowerCase();
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        String address = req.getParameter("address").toLowerCase();
        String city = req.getParameter("city").toLowerCase();
        String state = req.getParameter("state").toUpperCase();
        String zipcode = req.getParameter("zipcode");
        String taxCode = req.getParameter("taxCode");
        Integer numUsers = Integer.parseInt(req.getParameter("numUsers"));

        MongoCollection<Document> orgCollection = db.getCollection("organization");
        Document existingOrg = orgCollection.find(eq("orgName", orgName)).first();

        MongoCollection<Document> userCollection = db.getCollection("user");
        Document existingUser = userCollection.find(eq("username", username)).first();

        if (existingOrg != null) {
            ctx.result(OrgEnrollmentStatus.ORG_EXISTS.toString());
        } else if (existingUser != null) {
            ctx.result(UserMessage.USERNAME_ALREADY_EXISTS.getErrorName());
        } else {
            Argon2 argon2 = Argon2Factory.create();
            char[] passwordArr = password.toCharArray();
            String passwordHash;
            try {
                passwordHash = argon2.hash(10, 65536, 1, passwordArr);
                argon2.wipeArray(passwordArr);
            } catch (Exception e) {
                argon2.wipeArray(passwordArr);
                ctx.result(OrgEnrollmentStatus.PASS_HASH_FAILURE.toString());
                return;
            }

            Document newAdmin = new Document("username", username)
                .append("password", passwordHash)
                .append("organization", orgName)
                .append("email", email)
                .append("name", adminName)
                .append("privilegeLevel", "admin");
            userCollection.insertOne(newAdmin);

            Document newOrg = new Document("orgName", orgName)
                .append("website", orgWebsite)
                .append("contact number", orgContactPhoneNumber)
                .append("street address", address)
                .append("city", city)
                .append("state", state)
                .append("zipcode", zipcode)
                .append("taxCode", taxCode)
                .append("expectedNumUsers", numUsers);
            orgCollection.insertOne(newOrg);

            /*
            Algorithm algo = Algorithm.HMAC256("secret");
            String token = JWT.create()
                    .withClaim("privilegeLevel", "admin")
                    .withClaim("orgName", orgName)
                    .sign(algo);
            ctx.cookieStore("token", token);
             */
            ctx.result(OrgEnrollmentStatus.SUCCESSFUL_ENROLLMENT.toString());
        }
    };
}
