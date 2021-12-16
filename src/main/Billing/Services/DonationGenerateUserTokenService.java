package Billing.Services;

import Billing.BillingMessage;
import Config.Message;
import Config.Service;
import com.braintreegateway.BraintreeGateway;

public class DonationGenerateUserTokenService implements Service {
  private static BraintreeGateway gateway;

  public DonationGenerateUserTokenService(BraintreeGateway gateway) {
    DonationGenerateUserTokenService.gateway = gateway;
  }

  @Override
  public Message executeAndGetResponse() {
    String clientToken = gateway.clientToken().generate();
    return BillingMessage.SUCCESS.withMessage(clientToken);
  }
}
