package BillingTest;

import TestUtils.TestUtils;
import com.braintreegateway.BraintreeGateway;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;

public class DonationGenerateUserTokenServiceIntegrationTest {
  private static BraintreeGateway gateway =
      Mockito.mock(BraintreeGateway.class, Mockito.RETURNS_DEEP_STUBS);

  @BeforeClass
  public static void setUp() {
    TestUtils.startServer();
  }

  @Test
  public void success() {
    Mockito.when(gateway.clientToken().generate()).thenReturn("sampleHash");
    HttpResponse<String> response =
        Unirest.get(TestUtils.getServerUrl() + "/donation-generate-client-token")
            .header("Accept", "*/*")
            .header("Content-Type", "text/plain")
            .asString();
    JSONObject responseJSON = TestUtils.responseStringToJSON(response.getBody());
    assertThat(responseJSON.getString("status")).isEqualTo("SUCCESS");
    assertThat(responseJSON.getString("message")).isInstanceOf(String.class);
  }
}
