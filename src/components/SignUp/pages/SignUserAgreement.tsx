import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import SignaturePad from '../../../lib/SignaturePad';
import EULA from '../../AboutUs/EULA';
import SignUpContext from '../SignUp.context';

const messages = defineMessages({
  title: {
    id: 'signup.sign-user-agreement.title',
    defaultMessage: 'Sign Up- User Agreement',
  },

  header: {
    id: 'signup.sign-user-agreement.header',
    defaultMessage: 'Next, review and sign our End User Agreement.',
  },

  agreeToTerms: {
    id: 'signup.sign-user-agreement.agree-to-terms',
    defaultMessage: 'I agree to all terms and conditions to the EULA above.',
  },
});

export default function SignUserAgreement() {
  const intl = useIntl();
  const {
    signUpStageStateContext: {
      moveToPreviousSignupStage,
      moveToNextSignupStage,
    },
  } = useContext(SignUpContext);

  const [hasSigned, setHasSigned] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');

  return (
        <div>
            <Helmet>
                <title>{intl.formatMessage(messages.title)}</title>
                <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="d-flex justify-content-center pt-5">
                <div className="col-md-12">
                    <div className="text-center pb-4">
                        <h2>
                            <b>{intl.formatMessage(messages.header)}</b>
                        </h2>
                    </div>
                    <div className="col-md-12">
                        <EULA />
                    </div>
                    <div className="d-flex justify-content-center pt-5">
                        <div className="col-md-8">
                            <div className="pb-3">
                                {intl.formatMessage(messages.agreeToTerms)}
                            </div>
                            <SignaturePad
                              acceptEULA={hasSigned}
                              handleChangeAcceptEULA={setHasSigned}
                              handleCanvasSign={setCanvasDataUrl}
                              canvasDataUrl={canvasDataUrl}
                            />
                        </div>
                    </div>
                    <div className="d-flex">
                        <button
                          type="button"
                          className="btn btn-outline-primary mt-5"
                          onClick={moveToPreviousSignupStage}
                        >
                            Previous Step
                        </button>
                        <button
                          type="button"
                          className="ml-auto btn btn-primary mt-5"
                          onClick={moveToNextSignupStage}
                          disabled={!hasSigned}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
  );
}
