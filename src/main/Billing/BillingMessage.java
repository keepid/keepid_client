package Billing;

import Config.Message;
import org.json.JSONObject;

public enum BillingMessage implements Message {
  SUCCESS("SUCCESS:Success."),
  DONATION_CHECKOUT_FAILURE("DONATION_CHECKOUT_FAILURE:Failed to checkout"),
  DONATION_TOKEN_FAILURE("DONATION_TOKEN_FAILURE:Failed to generate client token");
  private String errorMessage;

  BillingMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public Message withMessage(String message) {
    this.errorMessage = getErrorName() + ":" + message;
    return this;
  }

  @Override
  public JSONObject toJSON() {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", getErrorDescription());
    return res;
  }

  @Override
  public JSONObject toJSON(String message) {
    JSONObject res = new JSONObject();
    res.put("status", getErrorName());
    res.put("message", message);
    return res;
  }

  @Override
  public String getErrorName() {
    return this.errorMessage.split(":")[0];
  }

  @Override
  public String getErrorDescription() {
    return this.errorMessage.split(":")[1];
  }

  @Override
  public String toResponseString() {
    return toJSON().toString();
  }
}
