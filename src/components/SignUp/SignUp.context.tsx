import React from 'react';

import Role from '../../static/Role';

export interface AccountInformationProperties {
  firstname: string;

  lastname: string;

  birthDate: Date | undefined;

  username: string;

  password: string;

  confirmPassword: string;
}

export interface OrganizationInformationProperties {
  orgName: string;

  orgWebsite: string;

  ein: string;

  orgAddress: string;

  orgCity: string;

  orgState: string;

  orgZipcode: string;

  orgPhoneNumber: string;

  orgEmail: string;
}

export enum SignupStage {
  ACCOUNT_INFORMATION,
  ORGANIZATION_INFORMATION,
  SIGN_USER_AGREEMENT,
  REVIEW_SUBMIT,
}

export interface SignupStageContextInterface {
  stages: SignupStage[];

  currentStage: SignupStage;

  setSignupStages(stages: SignupStage[]): void;

  moveToNextSignupStage(): void;

  moveToPreviousSignupStage(): void;

  moveToSignupStage(stage: SignupStage): void;
}

export type SignUpContextType = {
  accountInformationContext: {
    values: AccountInformationProperties;
    onPropertyChange: (
      key: keyof AccountInformationProperties,
      val: any
    ) => void;
  };
  organizationInformationContext: {
    values: OrganizationInformationProperties;
    onPropertyChange: (
      key: keyof OrganizationInformationProperties,
      val: any
    ) => void;
  };
  signUpStageStateContext: SignupStageContextInterface;
  authRole: Role;
  personRole?: Role;
};

export const defaultSignUpContextValue: SignUpContextType = {
  accountInformationContext: {
    values: {
      firstname: '',
      lastname: '',
      birthDate: undefined,
      username: '',
      password: '',
      confirmPassword: '',
    },
    onPropertyChange: () => {},
  },
  organizationInformationContext: {
    values: {
      orgName: '',
      orgWebsite: '',
      ein: '',
      orgAddress: '',
      orgCity: '',
      orgState: '',
      orgZipcode: '',
      orgPhoneNumber: '',
      orgEmail: '',
    },
    onPropertyChange: () => {},
  },
  signUpStageStateContext: {
    currentStage: SignupStage.ACCOUNT_INFORMATION,
    stages: [],
    setSignupStages: (stages: SignupStage[]) => {},
    moveToNextSignupStage: () => {},
    moveToPreviousSignupStage: () => {},
    moveToSignupStage: (stage: SignupStage) => {},
  },
  authRole: Role.LoggedOut,
  personRole: undefined,
};

const SignUpContext = React.createContext(defaultSignUpContextValue);
SignUpContext.displayName = 'SignUpContext';

export default SignUpContext;
