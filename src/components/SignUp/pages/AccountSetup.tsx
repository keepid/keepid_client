import React, { Component, ReactElement, useContext } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';

import {
  isValidPassword,
  isValidUsername,
} from '../../../lib/Validations/Validations';
import getServerURL from '../../../serverOverride';
import Role from '../../../static/Role';
import { InputType } from '../../BaseComponents/Inputs/FieldType';
import StructuredFormFromFields, { FormRowType } from '../../BaseComponents/Inputs/StructuredFormWithRows';
import SignUpContext from '../SignUp.context';
import { validateConfirmPassword, validatePassword, validateUsername } from '../SignUp.validators';
import * as validators from '../SignUp.validators';

interface Props {
  username: string;
  password: string;
  confirmPassword: string;
  onChangeUsername: () => void;
  onChangePassword: () => void;
  onChangeConfirmPassword: () => void;
  handleContinue: () => void;
  alert: any;
  role: Role;
}

interface State {
  usernameValidator: string;
  passwordValidator: string;
  confirmPasswordValidator: string;
}

export class AccountSetup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      usernameValidator: '',
      passwordValidator: '',
      confirmPasswordValidator: '',
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  colorToggle = (inputString: string): string => {
    if (inputString === 'true') {
      return 'is-valid';
    }
    if (inputString === 'false') {
      return 'is-invalid';
    }
    return '';
  };

  validateUsername = async (): Promise<void> => {
    const { username } = this.props;
    // ( if username is valid here and if username is taken)
    const notTaken: boolean = await fetch(`${getServerURL()}/username-exists`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        return status === 'SUCCESS';
      });
    if (isValidUsername(username) && notTaken) {
      await new Promise((resolve) =>
        this.setState({ usernameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) =>
        this.setState({ usernameValidator: 'false' }, resolve));
    }
  };

  usernameMessage = (): ReactElement<{}> => {
    const { usernameValidator } = this.state;
    if (usernameValidator === 'true') {
      return <div className="valid-feedback">This username is available.</div>;
    }
    if (usernameValidator === 'false') {
      return <div className="invalid-feedback">Invalid or taken username.</div>;
    }
    return <div className="mb-2" />;
  };

  validatePassword = async (): Promise<void> => {
    const { password } = this.props;
    // ( if password is valid here)
    if (isValidPassword(password)) {
      await new Promise((resolve) =>
        this.setState({ passwordValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) =>
        this.setState({ passwordValidator: 'false' }, resolve));
    }
  };

  passwordMessage = (): ReactElement<{}> => {
    const { passwordValidator } = this.state;
    if (passwordValidator === 'true') {
      return <div className="valid-feedback" />;
    }
    if (passwordValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Password must be at least 8 characters long.
        </div>
      );
    }
    return (
      <small id="emailHelp" className="form-text text-muted">
        Password must be at least 8 characters long.
      </small>
    );
  };

  validateConfirmPassword = async (): Promise<void> => {
    const { confirmPassword, password } = this.props;
    // ( if confirmed password is valid here)
    if (confirmPassword === password) {
      await new Promise((resolve) =>
        this.setState({ confirmPasswordValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) =>
        this.setState({ confirmPasswordValidator: 'false' }, resolve));
    }
  };

  confirmPasswordMessage = (): ReactElement<{}> => {
    const { confirmPasswordValidator } = this.state;
    if (confirmPasswordValidator === 'true') {
      return <div className="valid-feedback" />;
    }
    if (confirmPasswordValidator === 'false') {
      return <div className="invalid-feedback">Passwords do not match.</div>;
    }
    return <div />;
  };

  returnAccountMessage = () => {
    const { role } = this.props;
    switch (role) {
      case Role.Admin: {
        return (
          <div>
            Admins can set up accounts for
            <br />
            other workers in the organization and for clients.
          </div>
        );
      }
      case Role.Director:
      case Role.Worker:
      case Role.Volunteer: {
        return (
          <div>
            {`${role}s`}
            can set up
            <br />
            accounts for clients.
          </div>
        );
      }
      default: {
        return <div />;
      }
    }
  };

  handleStepComplete = async (e) => {
    e.preventDefault();
    await Promise.all([
      this.validateUsername(),
      this.validatePassword(),
      this.validateConfirmPassword(),
    ]);
    const { alert, handleContinue } = this.props;
    e.preventDefault();
    await Promise.all([
      this.validateUsername(),
      this.validatePassword(),
      this.validateConfirmPassword(),
    ]);
    const { usernameValidator, passwordValidator, confirmPasswordValidator } =
      this.state;
    if (
      usernameValidator === 'true' &&
      passwordValidator === 'true' &&
      confirmPasswordValidator === 'true'
    ) {
      handleContinue();
    } else {
      alert.show('One or more fields are invalid');
    }
  };

  render() {
    const { usernameValidator, passwordValidator, confirmPasswordValidator } =
      this.state;
    const {
      username,
      password,
      role,
      confirmPassword,
      onChangeUsername,
      onChangePassword,
      onChangeConfirmPassword,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>Sign Up- Account Setup</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-8">
            <div className="text-center pb-4 mb-2">
              <h2>
                <b>
                  First, set up the
                  {role}
                  account login.
                </b>
              </h2>
              <span>{this.returnAccountMessage()}</span>
            </div>
            <form onSubmit={this.handleStepComplete}>
              <div className="form-group row mt-3">
                <p className="col-sm-3 col-form-label text-sm-right ">
                  Username
                </p>
                <label htmlFor="username" className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(
                      usernameValidator,
                    )}`}
                    placeholder="Username"
                    id="username"
                    value={username}
                    onChange={onChangeUsername}
                    onBlur={this.validateUsername}
                  />
                  {this.usernameMessage()}
                </label>
              </div>
              <div className="form-group row">
                <p className="col-sm-3 col-form-label text-sm-right">
                  Password
                </p>
                <label htmlFor="password" className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(
                      passwordValidator,
                    )}`}
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChangePassword}
                    onBlur={this.validatePassword}
                  />
                  {this.passwordMessage()}
                </label>
              </div>
              <div className="form-group row">
                <p className="col-sm-3 col-form-label text-sm-right">
                  Confirm Password
                </p>
                <label htmlFor="confirmPassword" className="col-sm-9">
                  <input
                    type="password"
                    className={`form-control form-purple ${this.colorToggle(
                      confirmPasswordValidator,
                    )}`}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={onChangeConfirmPassword}
                    onBlur={this.validateConfirmPassword}
                  />
                  {this.confirmPasswordMessage()}
                </label>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary mt-5"
                  onSubmit={this.handleStepComplete}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(AccountSetup);

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

export const AccountSetupV2 = (): JSX.Element => {
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
          label: '',
          placeholder: 'First Name',
          name: 'firstname',
          type: InputType.TEXT,
          validate: validators.validateFirstname,
        },
        {
          label: '',
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
          label: '',
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
          label: '',
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
          label: '',
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
          label: '',
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
              console.log('validity: ', e.currentTarget.checkValidity());
              if (moveToNextSignupStage) {
                moveToNextSignupStage();
              }
            }}
            // @ts-ignore
            onPropertyChange={onPropertyChange}
            values={values || {}}
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
