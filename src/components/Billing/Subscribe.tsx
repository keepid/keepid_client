import {
  CardElement,
  ElementsConsumer,
} from '@stripe/react-stripe-js';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import React from 'react';
import { withAlert } from 'react-alert';
import Alert from 'react-bootstrap/Alert';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import LoginSVG from '../../static/images/login-svg.svg';

interface State {
      customerEmail: string,
      redirect: string | null,
      subscription: any,
      displayAlert: boolean,
    }

interface Props {
      stripe: Stripe | null,
      elements: StripeElements | null,
    }

class Subscribe extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      customerEmail: '',
      redirect: null,
      subscription: null,
      displayAlert: false,
    };
  }

    handleCustomerEmailChange = (event: any) => {
      this.setState({ customerEmail: event.target.value });
    }

    setRedirect = (redirectTo) => {
      this.setState({ redirect: redirectTo });
    }

    setSubscription = (sub) => {
      this.setState({ subscription: sub });
    }

    getCustomer = async () => {
      const { customerEmail } = this.state;

      await fetch(`${getServerURL()}/get-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const customerObject = responseJSON;

          if (customerObject) {
            this.handleCreateSubscription(customerObject.id, customerObject.name, customerObject.email);
          } else {
            console.log('Customer not found, are you sure it exists in the db?');
          }
        });
    }

    getAndSetSubscription = async (subscriptionId: String) => {
      await fetch(`${getServerURL()}/get-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const subscriptionObject = responseJSON;

          if (subscriptionObject) {
            this.setSubscription(subscriptionObject);

            const { subscription } = this.state;
            console.log('Current subscription is: ', subscription);

            this.setRedirect('/paymentConfirmation');
          } else {
            console.log('Subscription not found, did you provide an invalid id?');
          }
        });
    }

    handleConfirmCardPayment = async (customerEmail: string, subscriptionObject: any) => {
      const { stripe, elements } = this.props;

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        console.log('Stripe.js has not loaded yet');
        return '';
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        subscriptionObject.clientSecret,
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
      this.getAndSetSubscription(subscriptionObject.id);
      return '';
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

            if (subscriptionObject.id) {
              console.log('Payment is successful, subscription has been created with subscription_id: ', subscriptionObject.id);
              console.log(subscriptionObject);
              this.handleConfirmCardPayment(cusEmail, subscriptionObject);
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
      console.log(this.props);
      this.setState({ displayAlert: true });
      // const { alert } = this.props;
      // alert.show('You clicked pay');
      this.getCustomer();
    }

    render() {
      const { redirect, subscription } = this.state;
      console.log('Redirect with: ', subscription);
      if (redirect) {
        return (
          <Redirect to={{
            pathname: redirect,
            state: { subscription },
          }}
          />
        );
      }
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
                {this.state.displayAlert && (
                <Alert variant="info" onClose={() => console.log('You closed me!')} dismissible>
                  This is an alert!
                </Alert>
                )}
                <form id="payment-form" className="form-signin pt-10" onSubmit={this.handleSubmit}>
                  <h1 className="h3 mb-3 font-weight-normal">Please enter your information below</h1>
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

export default withAlert()(() => (
  <ElementsConsumer>
    {({ stripe, elements }) => (
      <Subscribe stripe={stripe} elements={elements} />
    )}
  </ElementsConsumer>
));
