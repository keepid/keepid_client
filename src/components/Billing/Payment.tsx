import {
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Helmet } from 'react-helmet';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import LoginSVG from '../../static/images/login-svg.svg';

interface props extends RouteComponentProps{
    location: any,
}

// eslint-disable-next-line react/prop-types
const Payment = ({ location }: props) => {
  useEffect(() => {
    console.log('location: ', location);
  }, []);

  const [email, setEmail] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Default alert message');
  const [showAlert, setShowAlert] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // initalize instance of stripe
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    // Stripe.js has not loaded yet. Make sure to disable
    // form submission until Stripe.js has loaded.
    return '';
  }

  const handleCustomerEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  if (redirect) {
    return (
      <Redirect to={{
        pathname: '/paymentConfirmation',
        state: { subscription },
      }}
      />
    );
  }

  return (
    <>
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
            <Alert variant="info" show={showAlert} onClose={() => setShowAlert(false)} dismissible>
              { alertMessage }
            </Alert>
            <form id="payment-form" className="form-signin pt-10" onSubmit={() => console.log('User clicked submit')}>
              <h1 className="h3 mb-3 font-weight-normal">Please enter your information below</h1>
              <label htmlFor="email" className="w-100 font-weight-bold">
                Email
                <input
                  type="email"
                  className="form-control form-purple mt-1"
                  id="email"
                  placeholder="johnDoe@gmail.com"
                  onChange={handleCustomerEmailChange}
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
  </>
};

export default withRouter(Payment);
