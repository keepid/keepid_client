package Organization;

import io.javalin.http.Context;
import org.json.JSONObject;

public class Organization {
  public String orgName;
  public String orgWebsite;
  public String orgEIN;
  public String orgStreetAddress;
  public String orgCity;
  public String orgState;
  public String orgZipcode;
  public String orgEmail;
  public String orgPhoneNumber;
  public Context ctx;

  public Organization() {}

  public Organization(Context ctx) {
    JSONObject req = new JSONObject(ctx.body());
    this.ctx = ctx;
    this.orgName = req.getString("organizationName").strip();
    this.orgWebsite = req.getString("organizationWebsite").toLowerCase().strip();
    this.orgEIN = req.getString("organizationEIN").strip();
    this.orgStreetAddress = req.getString("organizationAddressStreet").toUpperCase().strip();
    this.orgCity = req.getString("organizationAddressCity").toUpperCase().strip();
    this.orgState = req.getString("organizationAddressState").toUpperCase().strip();
    this.orgZipcode = req.getString("organizationAddressZipcode").strip();
    this.orgEmail = req.getString("organizationEmail").strip();
    this.orgPhoneNumber = req.getString("organizationPhoneNumber").strip();
  }
}
