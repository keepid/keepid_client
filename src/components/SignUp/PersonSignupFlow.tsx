import 'antd/dist/antd.css';

import { Steps } from 'antd';
import React, { useContext, useEffect } from 'react';
import { useAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import Role from '../../static/Role';
import AccountSetup from './pages/AccountSetup';
import AssignWorker from './pages/AssignWorker';
import ReviewSubmit from './pages/ReviewSubmit';
import { assignWorkerToUser, signupUser } from './SignUp.api';
import SignUpContext, { SignupStage } from './SignUp.context';

export default function PersonSignupFlow() {
  const {
    signUpStageStateContext,
    accountInformationContext,
    assignWorkersContext,
    personRole,
  } = useContext(SignUpContext);
  const alert = useAlert();
  const history = useHistory();

  const onSubmit = async (recaptchaToken: string): Promise<void> =>
    signupUser({
      accountInformation: accountInformationContext.values,
      recaptchaPayload: recaptchaToken,
      personRole: personRole || '',
    })
      .then((responseJSON) => {
        const { status, message } = responseJSON;
        if (status === 'ENROLL_SUCCESS') {
          if (assignWorkersContext.values.assignedWorkerUsername !== '') {
            assignWorkerToUser(accountInformationContext.values.username, [
              assignWorkersContext.values.assignedWorkerUsername,
            ]).then((isSuccess) => {
              if (isSuccess) {
                history.push('/login');
              } else {
                alert.error('Failed to assign worker');
              }
            });
          } else {
            alert.show(
              'You successfully signed up to use Keep.id. Please login with your new username and password',
            );
            history.push('/login');
          }
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
    const expectedLength = personRole !== Role.Worker && personRole !== Role.Admin && personRole !== Role.Director ? 3 : 2;
    if (signUpStageStateContext.stages?.length !== expectedLength) {
      // update this to add more stages
      const signupStages = [
        SignupStage.ACCOUNT_INFORMATION,
        SignupStage.REVIEW_SUBMIT,
      ];
      if (personRole !== Role.Worker && personRole !== Role.Admin && personRole !== Role.Director) {
        signupStages.splice(1, 0, SignupStage.ASSIGN_WORKER);
      }
      signUpStageStateContext?.setSignupStages?.call(null, signupStages);
    }
  }, [personRole, signUpStageStateContext.stages, signUpStageStateContext]);

  // @ts-ignore
  const currentStageIdx =
    signUpStageStateContext.stages?.indexOf(
      signUpStageStateContext.currentStage,
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
          {(personRole !== Role.Worker && personRole !== Role.Admin && personRole !== Role.Director) && (
            <Steps.Step title="Assign Worker" description="" />
          )}
          <Steps.Step title="Review & Submit" description="" />
        </Steps>
        <ProgressBar
          className="d-md-none"
          now={signUpStageStateContext.stages?.length ? (currentStageIdx / (signUpStageStateContext.stages.length - 1)) * 100 : 0}
          label={`Step ${currentStageIdx + 1} out of ${signUpStageStateContext.stages?.length || 1}`}
        />
        {signUpStageStateContext.currentStage ===
        SignupStage.ACCOUNT_INFORMATION ? (
          <AccountSetup />
          ) : null}
        {signUpStageStateContext.currentStage === SignupStage.ASSIGN_WORKER &&
        (personRole !== Role.Worker && personRole !== Role.Admin && personRole !== Role.Director) ? (
          <AssignWorker />
          ) : null}
        {signUpStageStateContext.currentStage === SignupStage.REVIEW_SUBMIT ? (
          <ReviewSubmit onSubmit={onSubmit} />
        ) : null}
      </div>
    </div>
  );
}
