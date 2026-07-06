import React, { useState } from 'react';
import { Route } from 'react-router-dom';

import Role from '../../static/Role';
import CompleteSignupFlow from './CompleteSignupFlow';
import SignUpContext, {
  AccountInformationProperties,
  AssignWorkerProperties,
  OrganizationInformationProperties,
  SignupStage,
  SignupStageContextInterface,
} from './SignUp.context';
import { onPropertyChange } from './SignUp.util';
import SignupBrancher from './SignupBrancher';

export type SignUpRouterProps = {
  role: Role;
};

export function useSignupStageContext(): SignupStageContextInterface {
  const [currentSignupStage, setCurrentSignupStage] = useState<SignupStage>(
    SignupStage.ACCOUNT_INFORMATION,
  );
  const [signupStages, setSignupStages] = useState<SignupStage[]>([]);

  return {
    currentStage: currentSignupStage,
    stages: signupStages,
    setSignupStages(stages: SignupStage[]): void {
      if (JSON.stringify(signupStages) !== JSON.stringify(stages)) {
        setSignupStages(stages);
      }
    },

    moveToNextSignupStage() {
      const currentIdx = (signupStages || []).indexOf(currentSignupStage);
      const nextIdx = Math.min((signupStages?.length || 1) - 1, currentIdx + 1);
      setCurrentSignupStage(signupStages[nextIdx]);
    },

    moveToPreviousSignupStage() {
      const currentIdx = (signupStages || []).indexOf(currentSignupStage);
      const nextIdx = Math.max(0, currentIdx - 1);
      setCurrentSignupStage(signupStages[nextIdx]);
    },

    moveToSignupStage(stage: SignupStage) {
      if (stage + 1) {
        setCurrentSignupStage(stage);
      }
    },
  };
}

function SignUpRouter({ role }: SignUpRouterProps) {
  const [accountInformation, setAccountInformation] =
    useState<AccountInformationProperties>({
      birthDate: undefined,
      confirmPassword: '',
      firstname: '',
      lastname: '',
      password: '',
      username: '',
    });
  const [organizationInformation, setOrganizationInformation] =
    useState<OrganizationInformationProperties>({
      ein: '',
      orgAddress: '',
      orgCity: '',
      orgEmail: '',
      orgName: '',
      orgPhoneNumber: '',
      orgState: '',
      orgWebsite: '',
      orgZipcode: '',
    });

  // set assignWorkersContext to use state
  const [assignWorkerInformation, setAssignWorkerInformation] =
    useState<AssignWorkerProperties>({
      assignedWorkerUsername: '',
    });

  const signUpStageStateContext = useSignupStageContext();

  return (
    <SignUpContext.Provider
      value={{
        accountInformationContext: {
          values: accountInformation,
          onPropertyChange: onPropertyChange(
            accountInformation,
            setAccountInformation,
          ),
        },

        organizationInformationContext: {
          values: organizationInformation,
          onPropertyChange: onPropertyChange(
            organizationInformation,
            setOrganizationInformation,
          ),
        },

        assignWorkersContext: {
          values: assignWorkerInformation,
          onPropertyChange: onPropertyChange(
            assignWorkerInformation,
            setAssignWorkerInformation,
          ),
        },

        signUpStageStateContext,
        authRole: role,
        personRole: undefined,
      }}
    >
      <Route path="/signup-branch">
        <SignupBrancher />
      </Route>
      <Route path="/organization-signup">
        <CompleteSignupFlow />
      </Route>
    </SignUpContext.Provider>
  );
}

export const paths = [
  '/signup-branch',
  '/organization-signup',
];

export default SignUpRouter;
