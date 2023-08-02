import classNames from 'classnames';
import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { defineMessages, useIntl } from 'react-intl';

import AccessDocuments from '../../static/images/homePage/access_documents.png';
// import Access from '../../static/images/access-data.svg';
import CreateAccount from '../../static/images/homePage/create_account.png';
import UploadDocuments from '../../static/images/homePage/my_documents.png';
import StreamlineApplications from '../../static/images/homePage/streamline_applications.png';

// import FileCloud from '../../static/images/file-cloud.svg';
// import SignUp from '../../static/images/sign-up.svg';
// import Spreadsheet from '../../static/images/spreadsheet.svg';
// import SyncFiles from '../../static/images/sync-files.svg';

const FocusingOnPeopleMessages = defineMessages({
  header: {
    id: 'home.client-journey.header',
    defaultMessage: 'Focusing on People',
  },

  step1Header: {
    id: 'home.client-journey.step-1-header',
    defaultMessage: 'Create an Account',
  },
  step1Detail: {
    id: 'home.client-journey.step-1-detail',
    defaultMessage: `Individuals experiencing homelessness (we call them clients)
                create a Keep.id account at participating nonprofits. Nonprofits
                then help homeless obtain missing identification.`,
  },
  step2Header: {
    id: 'home.client-journey.step-2-header',
    defaultMessage: 'Upload Documents',
  },
  step2Detail: {
    id: 'home.client-journey.step-2-detail',
    defaultMessage: `Government identification, personal information, and prison
                health records are securely uploaded to our cloud databases.
                These documents are also cryptographically signed and encrypted.`,
  },
  step3Header: {
    id: 'home.client-journey.step-3-header',
    defaultMessage: 'Access Documents',
  },
  step3Detail: {
    id: 'home.client-journey.step-3-detail',
    defaultMessage: `Those experiencing homelessness can access their documents at
                public or nonprofit computers.`,
  },
  step4Header: {
    id: 'home.client-journey.step-4-header',
    defaultMessage: 'Streamline Applications',
  },
  step4Detail1: {
    id: 'home.client-journey.step-4-detail1',
    defaultMessage: `Those experiencing homelessness can now use their data to apply
                for jobs, print their documents, and send autofilled aid
                applications.`,
  },
  step4Detail2: {
    id: 'home.client-journey.step-4-detail2',
    defaultMessage: `Nonprofits can utilize data to generate reports, create
                additional touch points for care, and streamline their filing
                operations.`,
  },

  buttonLearnMore: {
    id: 'home.client-journey.step-5-header',
    defaultMessage: 'Learn More',
  },
});

function FocusingOnPeople() {
  const intl = useIntl();
  return (
    <div className="py-5">
      <div className="w-100 partial-background">
        <div className="container">
          <h1 className="text-white pt-4 pb-4">
            {intl.formatMessage(FocusingOnPeopleMessages.header)}
          </h1>
        </div>
      </div>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 custom-vertical-center px-4">
            <div>
              <h3>
                {intl.formatMessage(FocusingOnPeopleMessages.step1Header)}
              </h3>
              <p className="pt-2 pb-2 home-paragraph-text">
                {intl.formatMessage(FocusingOnPeopleMessages.step1Detail)}
              </p>
            </div>
          </div>
          <div className="col-md-6 p-4">
            <img
              alt="Create an account image"
              src={CreateAccount}
              className="home-form-svg text-left"
            />
          </div>
        </div>
      </div>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 p-4 d-none d-md-block">
            <img
              alt="Create an account image"
              src={UploadDocuments}
              className="home-form-svg text-left"
            />
          </div>
          <div className="col-md-6 custom-vertical-center px-4">
            <div>
              <h3>
                {intl.formatMessage(FocusingOnPeopleMessages.step2Header)}
              </h3>
              <p className="pt-2 pb-2 home-paragraph-text">
                {intl.formatMessage(FocusingOnPeopleMessages.step2Detail)}
              </p>
            </div>
          </div>
          <div className="col-md-6 p-4 d-md-none">
            <img
              alt="Create an account image"
              src={UploadDocuments}
              className="home-form-svg text-left"
            />
          </div>
        </div>
      </div>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 custom-vertical-center px-4">
            <div>
              <h3>
                {intl.formatMessage(FocusingOnPeopleMessages.step3Header)}
              </h3>
              <p className="pt-2 pb-2 home-paragraph-text">
                {intl.formatMessage(FocusingOnPeopleMessages.step3Detail)}
              </p>
            </div>
          </div>
          <div className="col-md-6 p-4">
            <img
              alt="Create an account image"
              src={AccessDocuments}
              className="home-form-svg text-left"
            />
          </div>
        </div>
      </div>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 p-4 d-none d-md-block">
            <img
              alt="Create an account image"
              src={StreamlineApplications}
              className="home-form-svg text-left"
            />
          </div>
          <div className="col-md-6 custom-vertical-center px-4">
            <div>
              <h3>
                {intl.formatMessage(FocusingOnPeopleMessages.step4Header)}
              </h3>
              <p className="pt-2 pb-2 home-paragraph-text">
                {intl.formatMessage(FocusingOnPeopleMessages.step4Detail1)}
              </p>
              <p className="pt-2 pb-2 home-paragraph-text">
                {intl.formatMessage(FocusingOnPeopleMessages.step4Detail2)}
              </p>
              <AnchorLink offset="100" href="#info">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg w-40 mr-2 mb-2"
                >
                  {intl.formatMessage(FocusingOnPeopleMessages.buttonLearnMore)}
                </button>
              </AnchorLink>
            </div>
          </div>
          <div className="col-md-6 p-4 d-md-none">
            <img
              alt="Create an account image"
              src={StreamlineApplications}
              className="home-form-svg text-left"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusingOnPeople;
