import 'jquery-mask-plugin';

import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import USStates from '../../../static/data/states_titlecase.json';
import { InputType } from '../../BaseComponents/Inputs/FieldType';
import StructuredFormFromFields, {
  FormRowType,
} from '../../BaseComponents/Inputs/StructuredFormWithRows';
import SignUpContext from '../SignUp.context';
import {
  validateAddress,
  validateCity,
  validateEIN,
  validateEmail,
  validateOrgName,
  validateOrgWebsite,
  validatePhonenumber,
  validateState,
  validateZipcode,
} from '../SignUp.validators';

const messages = defineMessages({
  title: {
    id: 'signup.organization-information.title',
    defaultMessage: 'Sign Up- Organization Info',
  },

  subheader: {
    id: 'signup.organization-information.subheader',
    defaultMessage: 'Next, add in some contact information.',
  },

  firstNameInput: {
    id: 'signup.organization-information.inputs.firstName.label',
    defaultMessage: 'First Name',
  },

  lastNameInput: {
    id: 'signup.organization-information.inputs.lastName.label',
    defaultMessage: 'Last Name',
  },
});

const rows: FormRowType[] = [
  {
    rowLabel: 'Organization Name',
    fields: [
      {
        label: 'Organization Name',
        placeholder: 'Organization Name',
        name: 'orgName',
        type: InputType.TEXT,
        required: true,
        validate: validateOrgName,
      },
    ],
  },
  {
    rowLabel: 'Organization Website',
    fields: [
      {
        label: 'Organization Website',
        placeholder: 'Organization Website',
        name: 'orgWebsite',
        type: InputType.TEXT,
        required: true,
        validate: validateOrgWebsite,
      },
    ],
  },
  {
    rowLabel: 'Organization EIN',
    fields: [
      {
        label: 'Organization EIN',
        placeholder: 'Organization EIN',
        name: 'ein',
        type: InputType.TEXT,
        required: true,
        validate: validateEIN,
      },
    ],
  },
  {
    rowLabel: 'Organization Address',
    fields: [
      {
        label: 'Organization Address',
        placeholder: 'Organization Address',
        name: 'orgAddress',
        type: InputType.TEXT,
        required: true,
        validate: validateAddress,
      },
    ],
  },
  {
    rowLabel: '',
    fields: [
      {
        label: 'City',
        placeholder: 'City',
        name: 'orgCity',
        type: InputType.TEXT,
        required: true,
        validate: validateCity,
      },
      {
        label: 'State',
        placeholder: 'State',
        name: 'orgState',
        type: InputType.SELECT,
        required: true,
        validate: validateState,
        inputProps: {
          options: USStates.map((state) => ({
            label: state.abbreviation,
            value: state.abbreviation,
          })),
        },
      },
      {
        label: 'Zipcode',
        placeholder: 'Zipcode',
        name: 'orgZipcode',
        type: InputType.TEXT,
        required: true,
        validate: validateZipcode,
      },
    ],
  },
  {
    rowLabel: 'Organization Email Address',
    fields: [
      {
        label: 'Organization Email Address',
        placeholder: 'Organization Email',
        name: 'orgEmail',
        type: InputType.TEXT,
        required: true,
        validate: validateEmail,
      },
    ],
  },
  {
    rowLabel: 'Organization Phone Number',
    fields: [
      {
        label: 'Organization Phone Number',
        placeholder: 'Organization Phone Number',
        name: 'orgPhoneNumber',
        type: InputType.TEXT,
        required: true,
        validate: validatePhonenumber,
      },
    ],
  },
];

export default function OrganizationInformation(): JSX.Element {
  const intl = useIntl();

  const {
    organizationInformationContext: { values, onPropertyChange },
    signUpStageStateContext: {
      moveToNextSignupStage,
      moveToPreviousSignupStage,
    },
  } = useContext(SignUpContext);

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
              <b>{intl.formatMessage(messages.subheader)}</b>
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
                type="button"
                className="btn btn-outline-primary mt-5"
                onClick={moveToPreviousSignupStage}
              >
                Previous Step
              </button>
              <button type="submit" className="ml-auto btn btn-primary mt-5">
                Continue
              </button>
            </div>
          </StructuredFormFromFields>
        </div>
      </div>
    </div>
  );
}
