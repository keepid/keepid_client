import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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
  submitSuccessful: boolean,
}

class PersonSignup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);

    this.state = {
      buttonState: '',
      submitSuccessful: false,
    };

    this.onSubmitProp = this.onSubmitProp.bind(this);
  }

  onSubmitProp(personFirstName : string, personLastName : string, personBirthDate: string, personEmail: string,
    personPhoneNumber: string, personAddressStreet: string, personAddressCity: string, personAddressState: string,
    personAddressZipcode: string, personUsername: string, personPassword: string, personRoleString: string) {
    
    const {
      personRole,
    } = this.props;

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
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const userMessage = responseJSON;
        if(userMessage === "ENROLL_SUCCESS") {
          this.props.alert.show("Successfully Enrolled Person");
          this.setState({ submitSuccessful: true });
        } else if (userMessage === "USERNAME_ALREADY_EXISTS") {
          this.props.alert.show("Username Already Exists!");
        } else if (userMessage === "HASH_FAILURE") {
          this.props.alert.show("Server Failure: Please Try Again");
        } else {
          this.props.alert.show("Permissions Error");
        }
        this.setState({ buttonState: '' });
      }).catch((error) => {
        this.props.alert.show('Network Failure: Check Server Connection');
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
      <Signup personRole={personRole} buttonState={buttonState} onSubmitProp={this.onSubmitProp} />
    );
  }
}

export default withAlert()(PersonSignup);
