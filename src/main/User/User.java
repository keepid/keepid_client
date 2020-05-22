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
    this.firstName = req.getString("personFirstName").toUpperCase().strip();
    this.lastName = req.getString("personLastName").toUpperCase().strip();
    this.birthDate = req.getString("personBirthDate").strip();
    this.email = req.getString("personEmail").toLowerCase().strip();
    this.phone = req.getString("personPhoneNumber").strip();
    this.address = req.getString("personAddressStreet").toUpperCase().strip();
    this.city = req.getString("personAddressCity").toUpperCase().strip();
    this.state = req.getString("personAddressState").toUpperCase().strip();
    this.zipcode = req.getString("personAddressZipcode").strip();
    this.username = req.getString("personUsername").strip();
    this.password = req.getString("personPassword").strip();
    this.userLevel = req.getString("personRole");
  }
}
