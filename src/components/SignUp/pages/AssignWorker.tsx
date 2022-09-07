import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import { InputType } from '../../BaseComponents/Inputs/FieldType';
import StructuredFormFromFields, {
  FormRowType,
} from '../../BaseComponents/Inputs/StructuredFormWithRows';
import SignUpContext from '../SignUp.context';
import Table from '../../BaseComponents/Table';

const messages = defineMessages({
  title: {
    id: 'signup.assign-workers.title',
    defaultMessage: 'Sign Up- Assign Worker',
  },

  subheader: {
    id: 'signup.assign-workers.subheader',
    defaultMessage:
      'You have the option of assigning a worker to you. You can skip this step if this does not apply to you.',
  },
});

export default function AssignWorker(): JSX.Element {
  const {
    assignWorkersContext: { values, onPropertyChange },
    signUpStageStateContext: { moveToNextSignupStage },
    personRole,
  } = useContext(SignUpContext);

  const intl = useIntl();
  const tableCols = [
    {
      dataField: 'firstname',
      text: 'First Name',
      sort: true,
    },
    {
      dataField: 'lastname',
      text: 'Last Name',
      sort: true,
    },
    {
      dataField: 'username',
      text: 'Worker Username',
      sort: true,
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
              <b>
                {intl.formatMessage(messages.subheader, { role: personRole })}
              </b>
            </h2>
          </div>
          <StructuredFormFromFields
            rows={[]}
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
            <div>
              <select
                placeholder="Role"
                id="role"
                className="form-control form-purple"
                value={editedPersonRole}
                onChange={(e) =>
                  this.setState({ editedPersonRole: e.target.value })
                }
              >
                <option
                  defaultValue=""
                  disabled
                  hidden
                  aria-labelledby="role"
                />
                <option value="Admin">Admin</option>
                <option value="Worker">Worker</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </StructuredFormFromFields>
        </div>
      </div>
    </div>
  );
}
