import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';
import { withAlert } from 'react-alert';
import getServerURL from '../serverOverride';

interface Props{
  alert: any
}

interface State {
  bugTitle: string,
  bugDescription: string,
  isCaptchaFilled: boolean,
  buttonState: string
}

class BugReport extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bugTitle: '',
      bugDescription: '',
      isCaptchaFilled: false,
      buttonState: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.captchaVerify = this.captchaVerify.bind(this);
    this.handleChangeBugTitle = this.handleChangeBugTitle.bind(this);
    this.handleChangeBugDescription = this.handleChangeBugDescription.bind(this);
  }

  captchaVerify(value) {
    this.setState({ isCaptchaFilled: true });
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  handleSubmit(event: any) {
    this.setState({ buttonState: 'running' });
    const {
      bugTitle,
      bugDescription
    } = this.state;
    if (process.env.NODE_ENV === 'production' && !this.state.isCaptchaFilled) {
      this.props.alert.show('Please click the Recaptcha');
      this.setState({ buttonState: '' });
    } else {
      fetch(`${getServerURL()}/submit-bug`, {
        method: 'POST',
        body: JSON.stringify({
          bugTitle: bugTitle,
          bugDescription: bugDescription
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const submitStatus = responseJSON;
          if (submitStatus === 'SUBMIT_SUCCESS') {
            this.setState({ buttonState: '' });
            this.props.alert.show('Thank you for Submitting. We will look into this issue as soon as possible');
          } else {
            this.props.alert.show('Submit Failure');
            this.setState({ buttonState: '' });
          }
        }).catch((error) => {
          this.props.alert.show('Server Failure: ' + error);
          this.setState({ buttonState: '' });
        });
    }
  }
  
  handleChangeBugTitle(event: any) {
    this.setState({ bugTitle : event.target.value });
  }

  handleChangeBugDescription(event: any) {
    this.setState({ bugDescription: event.target.value });
  }

  render() {
    const {
      bugTitle,
      bugDescription
    } = this.state;
    return (
      <div className="container">
        <Helmet>
          <title>Report a Bug</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron jumbotron-fluid bg-white pb-2 mb-2">
              <div className="container">
                <h1 className="display-5 text-center font-weight-bold mb-3">Report a Bug</h1>
                <p className="lead">Thank you for helping us identify issues with our platform.</p>
              </div>
            </div>
            <form onSubmit={this.handleSubmit}>
              <div className="col-md-12">
                <div className="form-row">
                  <div className="col-md-12 form-group">
                    <label htmlFor="bugTitle" className="w-100 pr-3 font-weight-bold">
                      Issue Title
                      <input type="text" className="form-control form-purple" id="bugTitle" placeholder="Bug Title" value={bugTitle} 
                      onChange={this.handleChangeBugTitle} required />
                    </label>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="col-md-12 form-group">
                    <label htmlFor="bugDescription" className="w-100 pr-3">
                      Description of the Problem
                      <textarea className="form-control form-purple text-area-custom" id="bugDescription" placeholder="Leave a Detailed Description" 
                      value={bugDescription} onChange={this.handleChangeBugDescription} required />
                    </label>
                  </div>
                </div>
                <div className="form-row mt-2">
                  <div className="col-md-6">
                    <ReCAPTCHA
                      sitekey="6LdC2doUAAAAAOPR99_VV97ifNVQiF7I3RQOTc8T"
                      onChange={this.captchaVerify}
                    />
                  </div>
                  <div className="col-md-6 text-right pr-4">
                    <button type="submit" onClick={this.handleSubmit} className={`ml-5 btn btn-success ld-ext-right ${this.state.buttonState}`}>
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(BugReport);
