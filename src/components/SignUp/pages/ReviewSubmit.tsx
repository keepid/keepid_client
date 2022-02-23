import classNames from 'classnames';
import React, { useContext, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet';

import { reCaptchaKey } from '../../../configVars';
import SignUpContext, { SignupStage } from '../SignUp.context';

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

type Props = {
  onSubmit: (recaptchaPayload: string) => Promise<void>;
};

export default function ReviewSubmit({ onSubmit: onSubmitProp }: Props) {
  const {
    accountInformationContext: { values: accountInformation },
    organizationInformationContext: { values: organizationInformation },
    signUpStageStateContext: {
      moveToSignupStage,
      moveToPreviousSignupStage,
      stages,
    },
  } = useContext(SignUpContext);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      // @ts-ignore
      const token = await recaptchaRef.current.executeAsync();

      setIsLoading(true);

      await onSubmitProp(token);

      setIsLoading(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Sign Up- Organization Info</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <form>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-10">
            <div className="text-center pb-4 mb-2">
              <h2>
                <b>Verify all information is correct before submitting.</b>
              </h2>
            </div>
            <table className="table mb-4">
              <thead className="thead-light">
                <tr>
                  <th className="w-25" scope="col">
                    Account Setup
                  </th>
                  <th className="w-75" scope="col" />
                  <th
                    scope="col"
                    onClick={() =>
                      moveToSignupStage(SignupStage.ACCOUNT_INFORMATION)
                    }
                  >
                    <a href="#">Edit</a>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>
                    {`${accountInformation.firstname} ${accountInformation.lastname}`}
                  </td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Birthdate</th>
                  <td>
                    {accountInformation.birthDate?.toLocaleDateString('en-US')}
                  </td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Username</th>
                  <td>{accountInformation.username}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Password</th>
                  <td>
                    {accountInformation.password &&
                      '*'.repeat(accountInformation.password.length - 1)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
            {stages?.includes(SignupStage.ORGANIZATION_INFORMATION) ? (
              <table className="table mb-4">
                <thead className="thead-light">
                  <tr>
                    <th className="w-25" scope="col">
                      Organization Information
                    </th>
                    <th className="w-75" scope="col" />
                    <th
                      scope="col"
                      onClick={() =>
                        moveToSignupStage(SignupStage.ORGANIZATION_INFORMATION)
                      }
                    >
                      <a href="#">Edit</a>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Organization name</th>
                    <td>{organizationInformation.orgName}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Organization website</th>
                    <td>{organizationInformation.orgWebsite}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Organization address</th>
                    <td>
                      {organizationInformation.orgAddress}
                      <br />
                      {`${organizationInformation.orgCity}, ${organizationInformation.orgState} ${organizationInformation.orgZipcode}`}
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Organization EIN</th>
                    <td>{organizationInformation.ein}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Organization phone number</th>
                    <td>{organizationInformation.orgPhoneNumber}</td>
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">Organization email address</th>
                    <td>{organizationInformation.orgEmail}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            ) : null}
            <div className="mb-0">
              <span className="text-muted recaptcha-login-text">
                This page is protected by reCAPTCHA, and subject to the Google{' '}
                <a href="https://www.google.com/policies/privacy/">
                  Privacy Policy{' '}
                </a>
                and{' '}
                <a href="https://www.google.com/policies/terms/">
                  Terms of service
                </a>
                .
              </span>
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
                onClick={onSubmit}
                className={classNames(
                  'mt-5 ml-auto btn btn-primary ld-ext-right',
                  { running: isLoading },
                )}
              >
                Submit
                <div className="ld ld-ring ld-spin" />
              </button>
            </div>
          </div>
        </div>
        <ReCAPTCHA
          theme="dark"
          size="invisible"
          ref={recaptchaRef}
          sitekey={reCaptchaKey}
        />
      </form>
    </div>
  );
}
