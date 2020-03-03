package UserIntTests;

import Config.MongoConfig;
import com.google.gson.JsonObject;
import com.mongodb.BasicDBObject;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;
import io.javalin.http.Handler;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;

import java.security.SecureRandom;

import static com.mongodb.client.model.Filters.eq;

public class ChangePassword {
    MongoDatabase db;
    public ChangePassword(MongoDatabase db) {
        this.db = db;
    }
    public Handler resetPassword =
            ctx -> {
                JSONObject req = new JSONObject(ctx.body());
                String username = ctx.sessionAttribute("username");
                String newPass = RandomStringUtils.
                        random(8, 65, 122, true, true, null, new SecureRandom());
                MongoCollection<Document> userCollection = db.getCollection("user");
                Document user = userCollection.find(eq("username", username)).first();
                if (user == null) {
                    ctx.result("user does not exist");
                }
                else {
                    String email = user.get("email", String.class);
                    if (email == null) {
                        ctx.result("email not attached to this user");
                    }
                    else {
                        EmailUtil.sendEmail("smtp.gmail.com", "587", "keepidtest@gmail.com",
                                "Keep ID", "t3stPasw", email, "New Password",
                                "Your new password: " + newPass + "\nTo maintain security, " +
                                        "please change this password after logging in.");
                        ChangePassword.change(username, newPass, "user.get(\"password\", String.class)", db);
                    }

                }

            };
    public Handler changePasswordIn =
            ctx -> {
                JSONObject req = new JSONObject(ctx.body());
                String oldPassword = req.getString("oldPassword");
                String newPassword = req.getString("newPassword");
                String username = ctx.sessionAttribute("username");
                JSONObject res = new JSONObject();
                if (change(username, newPassword, oldPassword, db)){
                    res.put("status", "success");
                } else {
                    res.put("status", "failure");
                }
                ctx.json(res);
            };
    public static boolean change(String username, String newPassword, String oldPassword, MongoDatabase db) {
        Argon2 argon2 = Argon2Factory.create();
        MongoCollection<Document> userCollection = db.getCollection("user");
        Document user = userCollection.find(eq("username", username)).first();
        if (user == null) {
            return false;
        }
        char[] oldPasswordArr = oldPassword.toCharArray();
        char[] newPasswordArr = newPassword.toCharArray();
        String hash = user.get("password", String.class);
        System.out.println(user.get("password", String.class));
        if (!argon2.verify(hash, oldPasswordArr)) {
            argon2.wipeArray(oldPasswordArr);
            argon2.wipeArray(newPasswordArr);
            return false;
        }
        String passwordHash = argon2.hash(10, 65536, 1, newPasswordArr);

        Document query = new Document();
        query.append("_id",user.get("_id"));
        Document setData = new Document();
        setData.append("password", passwordHash);
        Document update = new Document();
        update.append("$set", setData);
        userCollection.updateOne(query, update);


        System.out.println(userCollection.find(eq("username", username)).first());
        argon2.wipeArray(oldPasswordArr);
        argon2.wipeArray(newPasswordArr);
        System.out.println(user.get("password", String.class));
        return true;
    }
}
