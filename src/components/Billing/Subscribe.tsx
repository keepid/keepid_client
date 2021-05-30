import {
  CardElement,
  ElementsConsumer,
} from '@stripe/react-stripe-js';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import LoginSVG from '../../static/images/login-svg.svg';

interface State {
      customerName: string,
      customerEmail: string,
    }

interface Props {
      stripe: Stripe | null,
      elements: StripeElements | null,
    }

class Subscribe extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      customerName: '',
      customerEmail: '',
    };
  }

    handleCustomerNameChange = (event: any) => {
      this.setState({ customerName: event.target.value });
    }

    handleCustomerEmailChange = (event: any) => {
      this.setState({ customerEmail: event.target.value });
    }

    handleConfirmCardPayment = async (customerEmail: string, clientSecret: string) => {
      const { stripe, elements } = this.props;

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        console.log('Stripe.js has not loaded yet');
        return '';
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { receipt_email: customerEmail },
      );

      if (error) {
        // show error and collect new card details.
        console.log(error.message);
        return '';
      }

      if (paymentIntent) {
        console.log(`Payment intent returned with id ${paymentIntent.id}`);
        console.log(paymentIntent);
        console.log(paymentIntent.receipt_email);
      }
      console.log('Redirecting');
      // eslint-disable-next-line object-curly-spacing
      return <Redirect to={{pathname: '/paymentConfirmation'}} />;
    }

    handleCreateSubscription = async (cusId, cusName, cusEmail) => {
      const { stripe, elements } = this.props;

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        console.log('Stripe.js has not loaded yet');
        return '';
      }

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement)!;

      // Use card Element to tokenize payment details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cusName,
        },
      });

      if (error) {
        // show error
        console.log(error.message);
        return '';
      }

      if (paymentMethod) {
        console.log(`Payment method created ${paymentMethod.id}`);

        // Create the subscription.
        await fetch(`${getServerURL()}/create-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: 'price_1ImsqAGU0udYRJ6gNdM61eOB',
            paymentMethodId: paymentMethod.id,
            customerId: cusId,
          }),
        }).then((response) => response.json())
          .then((responseJSON) => {
            const subscriptionObject = responseJSON;
            // console.log(subscriptionObject);

            if (subscriptionObject.subscriptionId) {
              console.log('Payment is successful, subscription has been created with subscription_id: ', subscriptionObject.subscriptionId);
              this.handleConfirmCardPayment(cusEmail, subscriptionObject.clientSecret);
            } else {
              console.log('Payment has been unsuccessful, please try again');
            }
          });
      }
      // console.log(`Subscription created with status: ${subscription.status}`);
      return '';
    }

    handleSubmit = async (e) => {
      e.preventDefault();

      console.log('User clicked pay');

      // Create the customer Id
      const { customerName, customerEmail } = this.state;

      await fetch(`${getServerURL()}/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const customerObject = responseJSON;
          // console.log(customerObject);

          if (customerObject) {
            console.log('Customer has been successfully created with customer_id of: ', customerObject.id);
            this.handleCreateSubscription(customerObject.id, customerName, customerEmail);
          } else {
            console.log('Customer creation has been unsuccessful, please try again');
          }
        });
    }

    render() {
      return (
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
                <form id="payment-form" className="form-signin pt-10" onSubmit={this.handleSubmit}>
                  <h1 className="h3 mb-3 font-weight-normal">Please enter your information below</h1>
                  <label htmlFor="fullname" className="w-100 font-weight-bold">
                    Name
                    <input
                      type="text"
                      className="form-control form-purple mt-1"
                      id="fullname"
                      placeholder="John Doe"
                      onChange={this.handleCustomerNameChange}
                      required
                    />
                  </label>
                  <label htmlFor="email" className="w-100 font-weight-bold">
                    Email
                    <input
                      type="email"
                      className="form-control form-purple mt-1"
                      id="email"
                      placeholder="johnDoe@gmail.com"
                      onChange={this.handleCustomerEmailChange}
                      required
                    />
                  </label>
                  <CardElement />
                  <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit">Pay</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
}

export default function InjectedCheckoutForm() {
  return (
    <ElementsConsumer>
      {({ stripe, elements }) => (
        <Subscribe stripe={stripe} elements={elements} />
      )}
    </ElementsConsumer>
  );
}
