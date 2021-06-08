import React from 'react';
import { Helmet } from 'react-helmet';

interface State {
    id: string,
}
interface Props{
    location: any,
}

// eslint-disable-next-line react/prefer-stateless-function
class paymentConfirmation extends React.Component<Props, State> {
  render() {
    const { subscriptionObj } = this.props.location.state;
    console.log(this.props);
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
            Subscription Id:
            {' '}
            { subscriptionObj.subscriptionId }
          </div>
        </div>
      </div>
    );
  }
}

export default paymentConfirmation;
