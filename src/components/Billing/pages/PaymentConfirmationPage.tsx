import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import getServerURL from '../../../serverOverride';

interface props{
    subscriptionId: any,
}

const PaymentConfirmationPage = ({ subscriptionId }: props) => {
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(0);

  useEffect(() => {
    getSubscription();
  }, []);

  const getSubscription = async () => {
    fetch(`${getServerURL()}/get-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          const subscriptionObject = JSON.parse(responseJSON.subscription);

          // Set parameters we want to display from the stripe subscription object
          setSubscriptionEndDate(subscriptionObject.current_period_end);
        } else {
          // Can add a alert to display status later
          console.log('Error: ', responseJSON.this.status);
        }
      });
  };

  return (
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
            { subscriptionId }
          </p>
          <p>
            Current period end:
            {' '}
            {(new Date(subscriptionEndDate * 1000).toString())}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
