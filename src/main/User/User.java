package User;

import io.javalin.http.Context;
import org.json.JSONObject;

public class User {
  public String firstName;
  public String lastName;
  public String birthDate;
  public String email;
  public String phone;
  public String address;
  public String city;
  public String state;
  public String zipcode;
  public String username;
  public String password;
  public String userLevel;
  public Context ctx;

  public User(Context ctx) {
    JSONObject req = new JSONObject(ctx.body());
    this.ctx = ctx;
    this.firstName = req.getString("firstname").toUpperCase().strip();
    this.lastName = req.getString("lastname").toUpperCase().strip();
    this.birthDate = req.getString("birthDate").strip();
    this.email = req.getString("email").toLowerCase().strip();
    this.phone = req.getString("phonenumber").strip();
    this.address = req.getString("address").toUpperCase().strip();
    this.city = req.getString("city").toUpperCase().strip();
    this.state = req.getString("state").toUpperCase().strip();
    this.zipcode = req.getString("zipcode").strip();
    this.username = req.getString("username").strip();
    this.password = req.getString("password").strip();
    this.userLevel = req.getString("personRole");
  }
}
