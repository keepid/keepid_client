import React from 'react';
import { Helmet } from 'react-helmet';

interface props{
    subscription: any
}

const PaymentConfirmationPage = ({ subscription }: props) => (
  <div className="container">
    <Helmet>
      <title>Payment Successful</title>
      <meta name="description" content="Keep.id" />
    </Helmet>
    <div className="jumbotron-fluid mt-5">
      <h1 className="mb-2">Thank you for your payment!</h1>
      <div className="lead-medium pt-2">
        You will be receiving an email with the receipt shortly
      </div>
      <br />
      <div>
        <p>
          Subscription Id:
          {' '}
          { subscription.id }
        </p>
        <p>
          Card last4:
          {' '}
          {subscription.default_payment_method?.card?.last4}
        </p>
        <p>
          Current period end:
          {' '}
          {(new Date(subscription.current_period_end * 1000).toString())}
        </p>
      </div>
    </div>
  </div>
);

export default PaymentConfirmationPage;
