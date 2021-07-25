import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Building from '../../static/images/building.svg';
import ConstantAvailabilityGraphic from '../../static/images/constant-availability.svg';
import ControlGraphic from '../../static/images/control.svg';
import DocTransferGraphic from '../../static/images/doc-transfer.svg';
import Profile from '../../static/images/profile-pic.svg';
import SecureGraphic from '../../static/images/security.svg';

const coreValuesMessages = defineMessages({
  header: {
    id: 'home.core-values.header',
    defaultMessage: 'Our Core User Values:',
  },
  secureAccess: {
    id: 'home.core-values.secure-access',
    defaultMessage: ' Secure Access',
  },
  constantAvailability: {
    id: 'home.core-values.constant-availability',
    defaultMessage: ' Constant Availability',
  },
  protectedDocumentTransfer: {
    id: 'home.core-values.protected-document-transfer',
    defaultMessage: ' Protected Document Transfer',
  },
  easeOfUse: {
    id: 'home.core-values.ease-of-use',
    defaultMessage: ' Ease of Use',
  },
});

const CoreValues = () => {
  const intl = useIntl();
  return (
    <div className="fluid-container mb-4 pt-5 pb-5 mx-0 background">
      <div className="container">
        <div className="row">
          {/* <div className="col-4 d-flex align-items-center">
                    <h1 className="font-weight-bold text-center">We understand the need for secure and convenient document access.</h1>
                  </div> */}
          <div className="col">
            <div className="row">
              <div className="col text-center d-flex justify-content-center">
                <h1 className="font-weight-bold">
                  {intl.formatMessage(coreValuesMessages.header)}
                </h1>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-3 mt-4 text-center">
                <img alt="security" src={SecureGraphic} className="home-svgs" />
                <h4 className="text-center">
                  {intl.formatMessage(coreValuesMessages.secureAccess)}
                </h4>
              </div>
              <div className="col-md-3 mt-4 text-center">
                <img
                  alt="security"
                  src={ConstantAvailabilityGraphic}
                  className="home-svgs"
                />
                <h4 className="text-center">
                  {intl.formatMessage(coreValuesMessages.constantAvailability)}
                </h4>
              </div>
              <div className="col-md-3 mt-4 text-center">
                <img
                  alt="security"
                  src={DocTransferGraphic}
                  className="home-svgs"
                />
                <h4 className="text-center">
                  {intl.formatMessage(
                    coreValuesMessages.protectedDocumentTransfer,
                  )}
                </h4>
              </div>
              <div className="col-md-3 mt-4 text-center">
                <img
                  alt="security"
                  src={ControlGraphic}
                  className="home-svgs"
                />
                <h4 className="text-center">
                  {intl.formatMessage(coreValuesMessages.easeOfUse)}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreValues;
