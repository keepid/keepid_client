import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import getServerURL from '../../../serverOverride';

interface props{
    handlePrevious: any,
    handleContinue: any,
    selectedPriceId,
    customer: any,
    setCustomer: any,
    subscription: any
    setSubscription: any,
}

// eslint-disable-next-line object-curly-newline
const PaymentPage = ({ handlePrevious, handleContinue, selectedPriceId, customer, setCustomer, subscription, setSubscription }: props) => {
  const [email, setEmail] = useState('');
  // const [customerName, setCustomerName] = useState('');
  // const [customerId, setCustomerId] = useState('');
  // const [customer, setCustomer] = useState(null);
  // const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    console.log('Subscription object is: ', subscription);
  }, [subscription]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Initializing stripe imports
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    // Stripe.js has not loaded yet. Make sure to disable
    // form submission until Stripe.js has loaded.
    console.log('Stripe.js has not loaded yet');
    return (<div>Stripe has not loaded</div>);
  }

  const handleConfirmCardPayment = async (customerEmail: string, subscription: any) => {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      subscription.clientSecret,
      { receipt_email: customerEmail },
    );

    if (error) {
      // show error and collect new card details.
      console.log(error.message);
    }

    if (paymentIntent) {
      console.log('Payment intent returned: ', paymentIntent);
      console.log(paymentIntent.receipt_email);
    }
    console.log('Redirecting');
    // eslint-disable-next-line object-curly-spacing
    // getAndSetSubscription(subscription.id);
    handleContinue();
  };

  const handleCreateSubscription = async (customer: any) => {
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
          if (responseJSON) {
            console.log('Subscription successfully created');
            setSubscription(responseJSON);
          } else {
            console.log('Subscription has failed to be made');
          }
        });
    } else {
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
        if (responseJSON) {
          // setCustomerName(responseJSON.name);
          // setCustomerId(responseJSON.id);
          setCustomer(responseJSON);
        } else {
          console.log('Customer not found, are you sure it exists in the db?');
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleGetCustomer();
    console.log('The customer object is: ', customer);
    await handleCreateSubscription(customer);
    console.log('The subscription object is: ', subscription);
    await handleConfirmCardPayment(email, subscription);
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
                <img alt="Login graphic" className="w-75 pt-5 mt-5 mr-3 float-right " />
              </div>
            </div>

            <div className="col">
              <form id="payment-form" className="form-signin pt-10">
                <h1 className="h3 mb-3 font-weight-normal">Please enter your information below</h1>
                <label htmlFor="email" className="w-100 font-weight-bold">
                  Email
                  <input
                    type="email"
                    className="form-control form-purple mt-1"
                    id="email"
                    placeholder="johnDoe@gmail.com"
                    onChange={handleEmailChange}
                    required
                  />
                </label>
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
