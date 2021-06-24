import React from 'react';
import { withAlert } from 'react-alert';
import { Redirect } from 'react-router-dom';

interface State {
    redirect: string | null,
    // subObject: object,
}

interface Props {
    alert: any,
}

class Main extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
    };
  }

  componentDidMount() {
    // const { location } = this.props;
    console.log('Props: ', this.props);
  }

  setRedirect = () => {
    this.setState({ redirect: '/paymentConfirmation' });
  }

  showError = (e) => {
    e.preventDefault();
    console.log(this.props);
    console.log('Error button clicked');
    const { alert } = this.props;
    alert.show('Error');
  }

  render() {
    const { redirect } = this.state;
    if (redirect) {
      console.log('Redirecting');
      return (
        <Redirect to={{
          pathname: redirect,
          state: {
            subscription: { id: 10 },
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
        <form id="error-form" className="form-signin pt-10" onSubmit={this.showError}>
          <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit">Show error</button>
        </form>
      </div>
    );
  }
}

export default withAlert()(Main);
