package Billing.Services;

import Billing.BillingMessage;
import Config.Message;
import Config.Service;
import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Result;
import com.braintreegateway.Transaction;
import com.braintreegateway.TransactionRequest;

import java.math.BigDecimal;

public class DonationCheckoutService implements Service {
  private String checkoutAmount;
  private String clientNonce;
  private static BraintreeGateway gateway;

  public DonationCheckoutService(
      String checkoutAmount, String clientNonce, BraintreeGateway gateway) {
    this.checkoutAmount = checkoutAmount;
    this.clientNonce = clientNonce;
    DonationCheckoutService.gateway = gateway;
  }

  @Override
  public Message executeAndGetResponse() {
    TransactionRequest transactionRequest =
        new TransactionRequest()
            .amount(new BigDecimal(this.checkoutAmount))
            .paymentMethodNonce(clientNonce)
            .options()
            .submitForSettlement(true)
            .done();

    Result<Transaction> transactionResult = gateway.transaction().sale(transactionRequest);
    if (transactionResult.isSuccess()) {
      return BillingMessage.SUCCESS;
    }

    return BillingMessage.DONATION_CHECKOUT_FAILURE;
  }
}
