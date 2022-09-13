import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { SelectPanel } from 'react-multi-select-component';

import getServerURL from '../../../serverOverride';
import Role from '../../../static/Role';
import { getAllWorkersFromOrganizationToAssign } from '../SignUp.api';
import SignUpContext from '../SignUp.context';

const messages = defineMessages({
  title: {
    id: 'signup.assign-workers.title',
    defaultMessage: 'Sign Up- Assign Worker',
  },

  subheader: {
    id: 'signup.assign-workers.subheader',
    defaultMessage: 'Assign a worker',
  },
});

export default function AssignWorker() {
  const {
    assignWorkersContext: { values, onPropertyChange },
    signUpStageStateContext: {
      moveToNextSignupStage,
      moveToPreviousSignupStage,
    },
    personRole,
  } = useContext(SignUpContext);
  const intl = useIntl();
  const [workersArray, setWorkers] = useState<any[]>([]);
  useEffect(() => {
    const getWorkers = async () => {
      const workers = await getAllWorkersFromOrganizationToAssign();
      setWorkers(workers);
    };
    getWorkers();
  }, []);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log(values.assignedWorkerUsername, 'final selection');
              moveToNextSignupStage();
            }}
          >
            <select
              placeholder="Select Worker to assign"
              id="assignedWorker"
              className="form-control form-purple"
              value={values?.assignedWorkerUsername || ''}
              onChange={(e) => {
                onPropertyChange('assignedWorkerUsername', e.target.value);
              }}
            >
              {workersArray !== undefined ? (
                workersArray.sort().map((worker: any) => (
                  <option key={worker.username} value={worker.username}>
                    {' '}
                    {worker.firstName} {worker.lastName}{' '}
                  </option>
                ))
              ) : (
                <div />
              )}
              <option key="" value="">
                No Workers Selected
              </option>
            </select>
            <p className="mr-3 mt-3 mb-3">
              You can skip this step if you do not want to assign a worker to
              this user
            </p>
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
          </form>
        </div>
      </div>
    </div>
  );
}
