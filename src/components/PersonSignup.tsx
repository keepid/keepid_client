import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import Role from '../static/Role';
import getServerURL from '../serverOverride';
import Signup from './Signup';

interface Props {
  personRole: Role,
  alert: any
}

interface State {
  buttonState: string,
  reaffirmStage: boolean,
  submitSuccessful: boolean,
}

class PersonSignup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);

    this.state = {
      buttonState: '',
      reaffirmStage: false,
      submitSuccessful: false,
    };

    this.onSubmitProp = this.onSubmitProp.bind(this);
  }

  onSubmitProp(personFirstName : string, personLastName : string, personBirthDate: string, personEmail: string,
    personPhoneNumber: string, personAddressStreet: string, personAddressCity: string, personAddressState: string,
    personAddressZipcode: string, personUsername: string, personPassword: string, personRoleString: string) {
    this.setState({ buttonState: 'running' });

    fetch(`${getServerURL()}/create-user`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        firstname: personFirstName,
        lastname: personLastName,
        birthDate: personBirthDate,
        username: personUsername,
        email: personEmail,
        phonenumber: personPhoneNumber,
        address: personAddressStreet,
        city: personAddressCity,
        state: personAddressState,
        zipcode: personAddressZipcode,
        password: personPassword,
        personRole: personRoleString,
        twoFactorOn: false
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          message,
        } = JSON.parse(responseJSON);
        if (status === 'ENROLL_SUCCESS') {
          this.setState({ buttonState: '' });
          this.setState({ submitSuccessful: true });
          this.props.alert.show(message);
        } else {
          this.props.alert.show(message);
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        this.props.alert.show(`Server Failure: ${error}`);
        this.setState({ buttonState: '' });
      });
  }

  render() {
    const {
      personRole,
    } = this.props;

    const {
      buttonState,
      submitSuccessful,
    } = this.state;

    if (submitSuccessful) {
      return (
        <Redirect to="/" />
      );
    }

    return (
      <div>
        <Signup personRole={personRole} buttonState={buttonState} onSubmitProp={this.onSubmitProp} />
      </div>
    );
  }
}

export default withAlert()(PersonSignup);
