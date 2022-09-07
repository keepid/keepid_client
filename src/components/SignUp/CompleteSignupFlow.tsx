import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { Steps } from 'antd';
import React, { useContext, useEffect } from 'react';
import { useAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import AccountSetup from './pages/AccountSetup';
import AssignWorker from './pages/AssignWorker';
import OrganizationInformation from './pages/OrganizationInformation';
import ReviewSubmit from './pages/ReviewSubmit';
import SignUserAgreement from './pages/SignUserAgreement';
import { signupOrganization } from './SignUp.api';
import SignUpContext, { SignupStage } from './SignUp.context';

export default function CompleteSignupFlow() {
  const {
    signUpStageStateContext,
    accountInformationContext,
    organizationInformationContext,
  } = useContext(SignUpContext);
  const alert = useAlert();
  const history = useHistory();

  const onSubmit = async (recaptchaToken: string): Promise<void> =>
    signupOrganization({
      accountInformation: accountInformationContext.values,
      organizationInformation: organizationInformationContext.values,
      recaptchaPayload: recaptchaToken,
    })
      .then((responseJSON) => {
        const { status, message } = responseJSON;
        if (status === 'SUCCESSFUL_ENROLLMENT') {
          alert.show(
            `You successfully signed up ${organizationInformationContext.values.orgName} to use Keep.id. Please login with your new username and password`,
          );
          history.push('/login');
        } else {
          alert.error(message);
        }
      })
      .catch((error) => {
        alert.error(`Server Failure: ${error}`);
      });

  useEffect(() => {
    if (!signUpStageStateContext.stages?.length) {
      signUpStageStateContext?.setSignupStages?.call(null, [
        SignupStage.ACCOUNT_INFORMATION,
        SignupStage.ORGANIZATION_INFORMATION,
        SignupStage.ASSIGN_WORKER,
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
          <Steps.Step title="Organization Information" description="" />
          <Steps.Step title="Assign Worker" description="" />
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
        SignupStage.ORGANIZATION_INFORMATION ? (
          <OrganizationInformation />
          ) : null}
        {signUpStageStateContext.currentStage === SignupStage.ASSIGN_WORKER ? (
          <AssignWorker />
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
