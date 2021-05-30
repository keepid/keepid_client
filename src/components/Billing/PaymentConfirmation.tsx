import React from 'react';
import { Helmet } from 'react-helmet';

interface State {
}
interface Props{
}

class paymentConfirmation extends React.Component<Props, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Payment Successful</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="mb-2">Thank you for your payment!</h1>
          <p className="lead-medium pt-2">
            You will be receiving an email with the receipt shortly
          </p>
        </div>
      </div>
    );
  }
}

export default paymentConfirmation;
