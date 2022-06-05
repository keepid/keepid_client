import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { response } from 'msw/lib/types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import getServerURL from '../../../serverOverride';
import LoginSVG from '../../../static/images/login-svg.svg';

interface props{
    handlePrevious: any,
    handleContinue: any,
    selectedPriceId,
    customer: any,
    setCustomer: any,
    subscriptionData: any
    setSubscriptionData: any,
    setSubscriptionId: any,
}

const PaymentPage = ({
  handlePrevious, handleContinue, selectedPriceId, customer, setCustomer, subscriptionData, setSubscriptionData, setSubscriptionId,
}: props) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (email !== '') {
      handleGetCustomer();
    }
  }, [email]);

  useEffect(() => {
    if (customer !== null) {
      handleCreateSubscription(customer);
    }
  }, [customer]);

  useEffect(() => {
    if (subscriptionData !== null) {
      handleConfirmCardPayment(email, subscriptionData);
    }
  }, [subscriptionData]);

  // Initializing stripe imports
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    // Stripe.js has not loaded yet. Make sure to disable
    // form submission until Stripe.js has loaded.
    console.log('Stripe.js has not loaded yet');
    return (<div>Stripe has not loaded</div>);
  }

  const handleConfirmCardPayment = async (customerEmail, subscription) => {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      subscription.clientSecret,
      { receipt_email: customerEmail },
    );

    if (error) {
      // show error and collect new card details.
      console.log(error.message);
    }

    if (paymentIntent) {
      console.log(paymentIntent.receipt_email);
    }
    // eslint-disable-next-line object-curly-spacing
    // getAndSetSubscription(subscription.id);
    handleContinue();
  };

  const handleCreateSubscription = async (customer) => {
    const cardElement = elements.getElement(CardElement)!;

    // Use card Element to tokenize payment details
    // paymentMethod is needed to create subscription so we initialize it first through stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: customer.name,
      },
    });

    if (error) {
      // show error
      console.log('An error has occured when creating a paymentMethod: ', error.message);
    }

    if (paymentMethod) {
      console.log('PaymentMethod returned: ', paymentMethod);

      // Create the subscription.
      await fetch(`${getServerURL()}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPriceId,
          paymentMethodId: paymentMethod.id,
          customerId: customer.id,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status === 'SUCCESS') {
            const subscriptionObject = JSON.parse(responseJSON.subscription);

            // Set parameters we want to display from the stripe subscription object
            setSubscriptionId(subscriptionObject.id);
            setSubscriptionData(subscriptionObject);
          } else {
            // Can add a alert to display status later
            console.log('Error: ', responseJSON.status);
          }
        });
    } else {
      // Can add a alert to display later
      console.log('Payment method not found');
    }
  };

  const handleGetCustomer = async () => {
    await fetch(`${getServerURL()}/get-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerEmail: email,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          const customerObject = JSON.parse(responseJSON.customer);

          // Set parameters we want to display from the stripe subscription object
          setCustomer(customerObject);
        } else {
          // Can add a alert to display status later
          console.log('Error: ', responseJSON.status);
        }
      });
  };

  const handleGetOrgEmail = async () => {
    await fetch(`${getServerURL()}/get-orgEmail`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          // Set parameters we want to display from the stripe subscription object
          setEmail(responseJSON.orgEmail);
        } else {
          // Can add a alert to display status later
          console.log('Error: ', responseJSON.message);
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*
        Billing flow is:
            1) Get organization email based on login user info
            2) Retrieve stripe customer obj based on email
            3) Create subscription using customer obj
            4) Confirm card payment with subscription
    */
    handleGetOrgEmail();
  };

  return (
    <div className="container">
      <h1>Payment page</h1>
      <div className="container">
        {/* Page Settings */}
        <Helmet>
          <title>Billing</title>
          <meta name="description" content="Keep.id" />
        </Helmet>

        {/* Left hand side with the graphic */}
        <div className="container">
          <div className="row mt-4">

            <div className="col mobile-hide">
              <div className="float-right w-100">
                <img alt="Login graphic" className="w-75 pt-5 mt-5 mr-3 float-right " src={LoginSVG} />
              </div>
            </div>

            <div className="col">
              <form id="payment-form" className="form-signin pt-10">
                <h1 className="h3 mb-3 font-weight-normal">Please enter your information below</h1>
                <CardElement />
                <button className="mt-2 btn btn-success loginButtonBackground w-50 ld-ext-left" type="submit" onClick={handlePrevious}>Back</button>
                <br />
                <button className="mt-2 btn btn-success loginButtonBackground w-50 ld-ext-right" type="submit" onClick={handleSubmit}>Pay</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
