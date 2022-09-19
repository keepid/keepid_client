import 'antd/dist/antd.css';

import { Steps } from 'antd';
import React, { useContext, useEffect } from 'react';
import { useAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import Role from '../../static/Role';
import AccountSetup from './pages/AccountSetup';
import ReviewSubmit from './pages/ReviewSubmit';
import SignUserAgreement from './pages/SignUserAgreement';
import { signupUserFromInvite } from './SignUp.api';
import SignUpContext, { SignupStage } from './SignUp.context';

interface Props {
  orgName: string;
  personRole: Role;
}

export default function InviteSignupFlow({ orgName, personRole }: Props) {
  const { signUpStageStateContext, accountInformationContext } =
    useContext(SignUpContext);
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
          <AccountSetup />
          ) : null}
        {signUpStageStateContext.currentStage ===
        SignupStage.SIGN_USER_AGREEMENT ? (
          <SignUserAgreement />
          ) : null}
        {signUpStageStateContext.currentStage === SignupStage.REVIEW_SUBMIT ? (
          <ReviewSubmit onSubmit={onSubmit} />
        ) : null}
      </div>
    </div>
  );
}
