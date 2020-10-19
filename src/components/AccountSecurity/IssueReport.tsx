import React from 'react';
import { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';
import { withAlert } from 'react-alert';
import getServerURL from '../../serverOverride';
import { reCaptchaKey } from '../../configVars';
import { isValidEmail } from '../../lib/Validations/Validations';

interface Props {
  alert: any,
}

interface State {
  title: string,
  description: string,
  email: string,
  buttonState: string,
  titleValidator: string,
  emailValidator: string
  descriptionValidator: string,
  recaptchaPayload: string,
}

const recaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

class IssueReport extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      email: '',
      buttonState: '',
      titleValidator: '',
      emailValidator: '',
      descriptionValidator: '',
      recaptchaPayload: '',
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  clearInput = ():void => {
    this.setState({
      title: '',
      description: '',
      email: '',
      buttonState: '',
      titleValidator: '',
      emailValidator: '',
      descriptionValidator: '',
      recaptchaPayload: '',
    });
    this.resetRecaptcha();
  }

  resetRecaptcha = () => {
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      recaptchaRef.current.reset();
    }
    this.setState({ recaptchaPayload: '' });
  }

  validateEmail = async ():Promise<void> => {
    const { email } = this.state;
    if (isValidEmail(email)) {
      await new Promise((resolve) => this.setState({ emailValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ emailValidator: 'false' }, resolve));
    }
  }

  emailMessage = (): ReactElement<{}> => {
    const { emailValidator } = this.state;
    if (emailValidator === 'true') {
      return (
        <div className="valid-feedback" />
      );
    } if (emailValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Please enter a valid email address.
        </div>
      );
    }
    return (
      <div />
    );
  }

  validateTitle = async ():Promise<void> => {
    const { title } = this.state;
    if (title !== '') {
      await new Promise((resolve) => this.setState({ titleValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ titleValidator: 'false' }, resolve));
    }
  }

  titleMessage = (): ReactElement<{}> => {
    const { emailValidator } = this.state;
    if (emailValidator === 'true') {
      return (
        <div className="valid-feedback"/>
      );
    } if (emailValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Please give a brief description of the issue.
        </div>
      );
    }
    return (
      <div />
    );
  }

  validateDescription = async ():Promise<void> => {
    const { description } = this.state;
    if (description !== '') {
      await new Promise((resolve) => this.setState({ descriptionValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ descriptionValidator: 'false' }, resolve));
    }
  }

  descriptionMessage = (): ReactElement<{}> => {
    const { descriptionValidator } = this.state;
    if (descriptionValidator === 'true') {
      return (
        <div className="valid-feedback"> </div>
      );
    } if (descriptionValidator === 'false') {
      return (
        <div className="invalid-feedback">
          Please provide additional details of the issue.
        </div>
      );
    }
    return (
      <div />
    );
  }

  colorToggle = (inputString: string): string => {
    if (inputString === 'true') {
      return 'is-valid';
    } if (inputString === 'false') {
      return 'is-invalid';
    }
    return '';
  }

  handleSubmitWithRecaptcha = async (event: any) => {
    event.preventDefault();
    if (recaptchaRef !== null && recaptchaRef.current !== null) {
      const recaptchaPayload = await recaptchaRef.current.executeAsync();
      this.setState({ recaptchaPayload });
    }
    else return;
    this.setState({ buttonState: 'running' });
    const { alert } = this.props;
    const {
      email,
      title,
      description,
      emailValidator,
      titleValidator,
      descriptionValidator,
      recaptchaPayload,
    } = this.state;

    await Promise.all([this.validateEmail(), this.validateTitle(), this.validateDescription()]);
    if (emailValidator !== 'true'
        || titleValidator !== 'true'
        || descriptionValidator !== 'true') {
      alert.show('Please fill out all fields correctly.'); 
      this.resetRecaptcha();
      this.setState( {buttonState: '' });
      return;
    }
    fetch(`${getServerURL()}/submit-issue`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        title,
        description,
        recaptchaPayload,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { status } = responseObject;

        if (status === 'SUCCESS') {
          alert.show('Thank you for bringing the issue to our attention. We will be working to address the problem.');
          this.clearInput();

        } else {
          alert.show('Failed to submit. Please fill out all fields correctly.');
          this.setState({ buttonState: '' });
          this.resetRecaptcha();
        }
      }).catch((error) => {
        alert.show('Failed to submit. Please try again.');
        this.setState({ buttonState: '' });
        this.resetRecaptcha();
      });

  }

  handleChangeTitle = (event: any) => {
    this.setState({ title: event.target.value });
  }

  handleChangeDescription = (event: any) => {
    this.setState({ description: event.target.value });
  }

  handleChangeEmail = (event: any) => {
    this.setState({ email: event.target.value });
  }

  render() {
    const {
      email,
      title,
      description,
      buttonState,
      titleValidator,
      emailValidator,
      descriptionValidator,
    } = this.state;
    return (
      <div className="container">
        <Helmet>
          <title>Report an Issue</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron jumbotron-fluid bg-white pb-2 mb-2">
              <div className="container">
                <h1 className="display-5 text-left font-weight-bold mb-1"> Report an Issue</h1>
                <p className="lead text-left font-weight-bolder py-3">Thank you for helping us identify issues with our platform.</p>
              </div>
            </div>
            <form onSubmit={this.handleSubmitWithRecaptcha}>
              <div className="col-md-12">
                <div className="form-row form-group d-flex align-content-start pb-3">
                  <div className="col-md-1" />
                  <label htmlFor="email" className="col-md-3 font-weight-bold text-sm-left text-lg-right pt-2 pr-3">
                    Email
                  </label>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className={`w-100 form-control form-purple ${this.colorToggle(emailValidator)}`}
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={this.handleChangeEmail}
                      onBlur={this.validateEmail}
                      required
                    />
                    {this.emailMessage()}
                  </div>
                  <div className="col-md-2" />
                </div>

                <div className="form-row form-group d-flex align-content-start pb-3">
                  <div className="col-md-1" />
                  <label htmlFor="title" className="col-md-3 font-weight-bold text-sm-left text-lg-right pt-2 pr-3">
                    Issue Title
                  </label>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className={`w-100 form-control form-purple ${this.colorToggle(titleValidator)}`}
                      id="title"
                      placeholder="What went wrong?"
                      value={title}
                      onChange={this.handleChangeTitle}
                      onBlur={this.validateTitle}
                      required
                    />
                    {this.titleMessage()}
                  </div>
                  <div className="col-md-2" />
                </div>
                <div className="form-row form-group d-flex align-content-start pb-3">
                  <div className="col-md-1" />
                  <label htmlFor="description" className="col-md-3 font-weight-bold text-sm-left text-lg-right pt-2 pr-3">
                    Issue Description
                  </label>
                  <div className="col-md-6">
                    <textarea
                      className={`w-100 form-control form-purple text-area-custom ${this.colorToggle(descriptionValidator)}`}
                      id="description"
                      placeholder="Please tell us more about the issue"
                      value={description}
                      onChange={this.handleChangeDescription}
                      onBlur={this.validateDescription}
                      required
                    />
                    {this.descriptionMessage()}
                  </div>
                  <div className="col-md-2" />
                </div>
                <div className="form-row mt-2">
                  <div className="col-md-10 pt-2 pb-2 d-flex justify-content-end">
                    <span className="text-muted recaptcha-login-text text-sm-left text-lg-right">
                      This page is protected by reCAPTCHA, and subject to the Google
                      {' '}
                      <a href="https://www.google.com/policies/privacy/">Privacy Policy </a>
                      and
                      {' '}
                      <a href="https://www.google.com/policies/terms/">Terms of Service</a>
                      .
                    </span>
                  </div>
                  <div className="col-md-2" />
                </div>
                <div className="form-row mt-2">
                  <div className="col-md-8" />
                  <div className="col-md-2 text-right d-flex justify-content-end pt-3">
                    <button type="submit" onClick={this.handleSubmitWithRecaptcha} className={`btn ld-ext-right btn-primary ${buttonState}`}>
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </button>
                  </div>
                  <div className="col-md-4 pb-5" />
                </div>
              </div>
            </form>
          </div>
        </div>
        <ReCAPTCHA
          theme="dark"
          size="invisible"
          ref={recaptchaRef}
          sitekey={reCaptchaKey}
        />
      </div>
    );
  }
}

export default withAlert()(IssueReport);
