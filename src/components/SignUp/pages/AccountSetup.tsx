import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import { InputType } from '../../BaseComponents/Inputs/FieldType';
import StructuredFormFromFields, { FormRowType } from '../../BaseComponents/Inputs/StructuredFormWithRows';
import SignUpContext from '../SignUp.context';
import { validateConfirmPassword, validatePassword, validateUsername } from '../SignUp.validators';
import * as validators from '../SignUp.validators';

const messages = defineMessages({
  title: {
    id: 'signup.account-setup.title',
    defaultMessage: 'Sign Up- Account Setup',
  },

  subheader: {
    id: 'signup.account-setup.subheader',
    defaultMessage: 'First, set up the {role} account login.',
  },
});

export const AccountSetup = (): JSX.Element => {
  const {
    accountInformationContext: {
      values,
      onPropertyChange,
    },
    signUpStageStateContext: {
      moveToNextSignupStage,
    },
    personRole,
  } = useContext(SignUpContext);

  const intl = useIntl();

  const rows: FormRowType[] = [
    {
      rowLabel: 'Name',
      fields: [
        {
          label: 'First Name',
          placeholder: 'First Name',
          name: 'firstname',
          type: InputType.TEXT,
          validate: validators.validateFirstname,
        },
        {
          label: 'Last Name',
          placeholder: 'Last Name',
          name: 'lastname',
          type: InputType.TEXT,
          validate: validators.validateLastname,
        },
      ],
    },
    {
      rowLabel: 'Birth Date',
      fields: [
        {
          label: 'Birth Date',
          placeholder: 'Birth Date',
          name: 'birthDate',
          type: InputType.DATE,
          validate: validators.validateBirthdate,
        },
      ],
    },
    {
      rowLabel: 'Username',
      fields: [
        {
          label: 'Username',
          placeholder: 'Username',
          name: 'username',
          required: true,
          type: InputType.TEXT,
          validate: validateUsername,
        },
      ],
    },
    {
      rowLabel: 'Password',
      fields: [
        {
          label: 'Password',
          placeholder: 'Password',
          name: 'password',
          required: true,
          type: InputType.PASSWORD,
          validate: validatePassword,
        },
      ],
    },
    {
      rowLabel: 'Confirm Password',
      fields: [
        {
          label: 'Confirm Password',
          placeholder: 'Confirm Password',
          name: 'confirmPassword',
          required: true,
          type: InputType.PASSWORD,
          validate: (confirmPwd) =>
            validateConfirmPassword(
              confirmPwd,
              values?.password || '',
            ),
        },
      ],
    },
  ];

  return (
    <div>
      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="d-flex justify-content-center pt-5">
        <div className="col-md-10">
          <div className="text-center pb-4 mb-2">
            <h2>
              <b>{intl.formatMessage(messages.subheader, { role: personRole })}</b>
            </h2>
          </div>
          <StructuredFormFromFields
            rows={rows}
            onSubmit={(e) => {
              e.preventDefault();
              if (e.currentTarget.checkValidity() && moveToNextSignupStage) {
                moveToNextSignupStage();
              }
            }}
            // @ts-ignore
            onPropertyChange={onPropertyChange}
            values={values || {}}
            labelClassName="d-none"
          >
            <div className="d-flex">
              <button
                type="submit"
                className="ml-auto btn btn-primary mt-5"
              >
                Continue
              </button>
            </div>
          </StructuredFormFromFields>
        </div>
      </div>
    </div>
  );
};

export default AccountSetup;
