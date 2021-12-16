package Billing;

import Billing.Services.DonationCheckoutService;
import Billing.Services.DonationGenerateUserTokenService;
import Config.Message;
import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Environment;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

@Slf4j
public class BillingController {
  private static BraintreeGateway gateway;

  public BillingController() {
    gateway =
        new BraintreeGateway(
            Environment.SANDBOX,
            System.getenv("BT_MERCHANT_ID"),
            System.getenv("BT_PUBLIC_KEY"),
            System.getenv("BT_PRIVATE_KEY"));
  }

  public Handler donationGenerateClientToken =
      ctx -> {
        DonationGenerateUserTokenService donationGenerateUserTokenService =
            new DonationGenerateUserTokenService(gateway);
        Message res = donationGenerateUserTokenService.executeAndGetResponse();
        ctx.result(res.toResponseString());
      };

  public Handler donationCheckout =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        String nonceFromClient = req.getString("payment_method_nonce");
        String amount = req.getString("amount");

        DonationCheckoutService donationCheckoutService =
            new DonationCheckoutService(amount, nonceFromClient, gateway);
        Message res = donationCheckoutService.executeAndGetResponse();
        ctx.result(res.toResponseString());
      };
}
