import React from 'react';
import { Redirect } from 'react-router-dom';

interface State {
    redirect: string | null,
    // subObject: object,
}

interface Props {

}

class Main extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
    };
  }

  setRedirect = () => {
    this.setState({ redirect: '/paymentConfirmation' });
  }

  render() {
    console.log('hi 1');
    const { redirect } = this.state;
    if (redirect) {
      console.log('hi');
      return (
        <Redirect to={{
          pathname: redirect,
          state: {
            subscriptionObj: { subscriptionId: 10 },
          },
        }}
        />
      );
    }
    return (
      <div className="container">
        Click this button to be redirected
        <form id="payment-form" className="form-signin pt-10" onSubmit={this.setRedirect}>
          <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit">Redirect</button>
        </form>
      </div>
    );
  }
}

export default Main;
