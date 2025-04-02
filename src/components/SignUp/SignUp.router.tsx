import React, { useState } from 'react';
import { useAlert } from 'react-alert';
import { Redirect, Route } from 'react-router-dom';

import Role, { canAuthRoleCreateRole, roleFromString } from '../../static/Role';
import CompleteSignupFlow from './CompleteSignupFlow';
import InviteSignupFlow from './InviteSignupFlow';
import InviteSignupJWT from './InviteSignupJWT';
import PersonSignupFlow from './PersonSignupFlow';
import SignUpContext, {
  AccountInformationProperties,
  AssignWorkerProperties,
  OrganizationInformationProperties,
  SignupStage,
  SignupStageContextInterface,
} from './SignUp.context';
import { onPropertyChange } from './SignUp.util';
import SignupBrancher from './SignupBrancher';

import jwtDecode from 'jwt-decode';

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
  const alert = useAlert();
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

  const [personRole, setPersonRole] = useState<Role | undefined>();

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
        personRole,
      }}
    >
      <Route path="/signup-branch">
        <SignupBrancher />
      </Route>
      <Route path="/organization-signup">
        <CompleteSignupFlow />
      </Route>
      <Route
        path="/person-signup/:roleString"
        render={(props) => {
          const personRoleFromParams = roleFromString(
            props.match.params.roleString,
          );
          if (personRoleFromParams !== personRole) {
            setPersonRole(personRoleFromParams);
          }

          if (canAuthRoleCreateRole(role, personRoleFromParams)) {
            return <PersonSignupFlow />;
          }
          alert.error(`A ${role} cannot sign up a new ${personRoleFromParams}`);
          return <Redirect to="/error" />;
        }}
      />
      <Route
        path="/create-user/:jwt"
        render={(props) => {
          const { jwt } = props.match.params;
          try {
            const decoded = jwtDecode(jwt);
            const currentTime = Date.now() / 1000;
            if (decoded.exp > currentTime) {
              return (
                <InviteSignupFlow
                  orgName={decoded.organization}
                  personRole={decoded.role}
                />
              );
            }
          } catch (err) {
            return <Redirect to="/error" />;
          }
          return <Redirect to="/error" />;
        }}
      >
        <InviteSignupJWT />
      </Route>
    </SignUpContext.Provider>
  );
}

export const paths = [
  '/signup-branch',
  '/organization-signup',
  '/person-signup/:roleString',
  '/create-user/:jwt',
];

export default SignUpRouter;
