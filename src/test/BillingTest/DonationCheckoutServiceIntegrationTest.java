package BillingTest;

import TestUtils.TestUtils;
import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Result;
import com.braintreegateway.Transaction;
import com.braintreegateway.TransactionRequest;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;

public class DonationCheckoutServiceIntegrationTest {
  private static BraintreeGateway gateway =
      Mockito.mock(BraintreeGateway.class, Mockito.RETURNS_DEEP_STUBS);
  private static TransactionRequest transactionRequest = Mockito.mock(TransactionRequest.class);
  private static Result<Transaction> transactionResult = Mockito.mock(Result.class);

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
  }

  @Test
  public void success() {
    Mockito.when(gateway.transaction().sale(transactionRequest)).thenReturn(transactionResult);
    JSONObject request = new JSONObject();
    request.put("payment_method_nonce", "fake-valid-nonce");
    request.put("amount", "10");
    HttpResponse<String> response =
        Unirest.post(TestUtils.getServerUrl() + "/donation-checkout")
            .body(request.toString())
            .asString();
    JSONObject responseJSON = TestUtils.responseStringToJSON(response.getBody());
    assertThat(responseJSON.getString("status")).isEqualTo("SUCCESS");
  }

  /**
   * Unable to correctly mock failed response @Test public void failure() {
   * Mockito.when(gateway.transaction().sale(transactionRequest)).thenReturn(transactionResult);
   * JSONObject request = new JSONObject(); request.put("payment_method_nonce",
   * "fake-processor-declined-visa-nonce"); request.put("amount", "10"); HttpResponse<String>
   * response = Unirest.post(TestUtils.getServerUrl() + "/donation-checkout")
   * .body(request.toString()) .asString(); JSONObject responseJSON =
   * TestUtils.responseStringToJSON(response.getBody());
   * assertThat(responseJSON.getString("status")).isEqualTo("FAILURE"); }
   */
}
