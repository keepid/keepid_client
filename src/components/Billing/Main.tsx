import React from 'react';
import { Redirect } from 'react-router-dom';

interface State {
}
interface Props{
}

class Main extends React.Component<Props, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Redirected');
    return (<Redirect to={{ pathname: '/paymentConfirmation' }} />);
  }

  render() {
    return (
      <div className="container">
        Click this button to be redirected
        <form id="payment-form" className="form-signin pt-10" onSubmit={this.handleSubmit}>
          <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit">Redirect</button>
        </form>
      </div>
    );
  }
}

export default Main;
