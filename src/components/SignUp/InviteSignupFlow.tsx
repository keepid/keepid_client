import 'antd/dist/antd.css';

import { Steps } from 'antd';
import React, { Component, useContext, useEffect, useState } from 'react';
import { useAlert, withAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Redirect, useHistory } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import AccountSetup, { AccountSetupV2 } from './pages/AccountSetup';
import { OrganizationInformationV2 } from './pages/OrganizationInformation';
import PersonalInformation from './pages/PersonalInformation';
import { ReviewSubmitV2 } from './pages/ReviewSubmit';
import ReviewSubmitInviteSignupVersion from './pages/ReviewSubmitInviteSignupVersion';
import SignUserAgreement, {
  SignUserAgreementV2,
} from './pages/SignUserAgreement';
import { signupOrganization, signupUser, signupUserFromInvite } from './SignUp.api';
import SignUpContext, { SignupStage } from './SignUp.context';
import { birthDateStringConverter } from './SignUp.util';

const { Step } = Steps;

interface Props {
  alert: any;
  orgName: string;
  personRole: Role;
}

interface State {
  signupStage: number;
  username: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  birthDate: Date;
  email: string;
  phonenumber: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  hasSigned: boolean;
  recaptchaPayload: string;
  buttonState: string;
  redirectLogin: boolean;
}

const InviteSignupFlow = (props: Props) => {
  const { orgName, alert, personRole } = props;

  const [signupStage, setSignupStage] = useState(0);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasSigned, setHasSigned] = useState(false);
  const [recaptchaPayload, setRecaptchaPayload] = useState('');
  const [buttonState, setButtonState] = useState('');
  const [redirectLogin, setRedirectLogin] = useState(false);

  function createUser() {
    const birthDateString = birthDateStringConverter(birthDate);
    // submit user information

    fetch(`${getServerURL()}/create-invited-user`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        firstname,
        lastname,
        birthDate: birthDateString,
        email,
        phonenumber: phoneNumber,
        address,
        city,
        state,
        zipcode,
        twoFactorOn: false,
        username,
        password,
        personRole,
        orgName,
        recaptchaPayload,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status, message } = responseJSON;

        if (status === 'ENROLL_SUCCESS') {
          setButtonState('');
          alert.show(
            'You successfully signed up to use Keep.id. Please login with your new username and password',
          );
          setRedirectLogin(true);
        } else if (status === 'INVALID_PARAMETER') {
          setButtonState('');

          alert.show(
            'No organization found for this link. Try again with different link',
          );
        } else {
          alert.show(message);
          setButtonState('');
        }
      })
      .catch((error) => {
        alert.show(`Server Failure: ${error}`);
        setButtonState('');
      });
  }

  useEffect(() => {
    if (recaptchaPayload) {
      createUser();
    }
  }, [recaptchaPayload]);

  /**
   * Returns a function that can be used as an onChange callback
   * @param setStateFn - the function to call with the event.target.value onChange
   * @return Function - the function to pass as the onChange handler
   */
  const stateUpdateWrapper = (setStateFn) => ({ target: { value } }) =>
    setStateFn(value);

  const handleSignupComponentRender = (): JSX.Element => {
    switch (signupStage) {
      case 0: {
        return (
          <AccountSetup
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            onChangeUsername={stateUpdateWrapper(setUsername)}
            onChangePassword={stateUpdateWrapper(setPassword)}
            onChangeConfirmPassword={stateUpdateWrapper(setConfirmPassword)}
            handleContinue={() => setSignupStage(signupStage + 1)}
            role={personRole}
          />
        );
      }
      case 1: {
        return (
          <PersonalInformation
            firstname={firstname}
            lastname={lastname}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phoneNumber}
            email={email}
            onChangeFirstname={stateUpdateWrapper(setFirstname)}
            onChangeLastname={stateUpdateWrapper(setLastname)}
            onChangeBirthDate={setBirthDate}
            onChangeAddress={stateUpdateWrapper(setAddress)}
            onChangeCity={stateUpdateWrapper(setCity)}
            onChangeState={stateUpdateWrapper(setState)}
            onChangeZipcode={stateUpdateWrapper(setZipcode)}
            onChangePhoneNumber={stateUpdateWrapper(setPhoneNumber)}
            onChangeEmail={stateUpdateWrapper(setEmail)}
            handleContinue={() => setSignupStage(signupStage + 1)}
            handlePrevious={() => setSignupStage(signupStage - 1)}
          />
        );
      }
      case 2: {
        return (
          <SignUserAgreement
            hasSigned={hasSigned}
            handleChangeSignEULA={setHasSigned}
            handleContinue={() => setSignupStage(signupStage + 1)}
            handlePrevious={() => setSignupStage(signupStage - 1)}
          />
        );
      }
      case 3: {
        return (
          <ReviewSubmitInviteSignupVersion
            username={username}
            password={password}
            firstname={firstname}
            lastname={lastname}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phoneNumber}
            email={email}
            // handleSubmit={handleFormSubmit}
            handlePrevious={() => setSignupStage(signupStage - 1)}
            handleFormJumpTo={stateUpdateWrapper(setSignupStage)}
            buttonState={buttonState}
            handleChangeRecaptcha={setRecaptchaPayload}
          />
        );
      }
      default: {
        return <div />;
      }
    }
  };

  if (redirectLogin) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Helmet>
        <title>Sign Up</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="container mt-5">
        <Steps className="d-none d-md-flex" progressDot current={signupStage}>
          <Step title={`${personRole} Account Setup`} description="" />
          <Step title="Personal Information" description="" />
          <Step title="Sign User Agreement" description="" />
          <Step title="Review & Submit" description="" />
        </Steps>
        <ProgressBar
          className="d-md-none"
          now={signupStage * 25}
          label={`Step ${signupStage + 1} out of 4`}
        />
        {handleSignupComponentRender()}
      </div>
    </div>
  );
};

export default withAlert()(InviteSignupFlow);

interface PropsV2 {
  orgName: string;
  personRole: Role;
}

export const InviteSignupFlowV2 = ({ orgName, personRole }: PropsV2) => {
  const { signUpStageStateContext, accountInformationContext } = useContext(
    SignUpContext,
  );
  const alert = useAlert();
  const history = useHistory();

  const onSubmit = async (recaptchaToken: string): Promise<void> =>
    signupUserFromInvite({
      accountInformation: accountInformationContext.values,
      recaptchaPayload: recaptchaToken,
      orgName,
      personRole,
    })
      .then((responseJSON) => {
        const { status, message } = responseJSON;
        if (status === 'ENROLL_SUCCESS') {
          alert.show(
            'You successfully signed up to use Keep.id. Please login with your new username and password',
          );
          history.push('/login');
        } else if (status === 'INVALID_PARAMETER') {
          alert.error(
            'No organization found for this link. Try again with different link',
          );
        } else {
          alert.error(message);
        }
      })
      .catch((error) => {
        alert.error(`Server Failure: ${error}`);
      });

  useEffect(() => {
    if (signUpStageStateContext.stages?.length !== 3) {
      signUpStageStateContext?.setSignupStages?.call(null, [
        SignupStage.ACCOUNT_INFORMATION,
        SignupStage.SIGN_USER_AGREEMENT,
        SignupStage.REVIEW_SUBMIT,
      ]);
    }
  });

  // @ts-ignore
  const currentStageIdx =
    signUpStageStateContext.stages?.indexOf(
      signUpStageStateContext.currentStage
    ) || 0;

  return (
    <div>
      <Helmet>
        <title>Sign Up</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="container mt-5">
        <Steps
          className="d-none d-md-flex"
          progressDot
          current={currentStageIdx}
        >
          <Steps.Step title="Account Setup" description="" />
          <Steps.Step title="Sign User Agreement" description="" />
          <Steps.Step title="Review & Submit" description="" />
        </Steps>
        <ProgressBar
          className="d-md-none"
          now={currentStageIdx * 33.4}
          label={`Step ${currentStageIdx + 1} out of 4`}
        />
        {signUpStageStateContext.currentStage ===
        SignupStage.ACCOUNT_INFORMATION ? (
          <AccountSetupV2 />
          ) : null}
        {signUpStageStateContext.currentStage ===
        SignupStage.SIGN_USER_AGREEMENT ? (
          <SignUserAgreementV2 />
          ) : null}
        {signUpStageStateContext.currentStage === SignupStage.REVIEW_SUBMIT ? (
          <ReviewSubmitV2 onSubmit={onSubmit} />
        ) : null}
      </div>
    </div>
  );
};
