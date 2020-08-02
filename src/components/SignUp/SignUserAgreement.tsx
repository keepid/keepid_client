import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import EULA from '../../static/EULA.pdf';
import SignaturePad from '../../lib/react-typescript-signature-pad';

interface Props {
  signature: Blob,
  handleContinue: () => void,
  handlePrevious: ()=> void,
  alert: any
  hasSigned: boolean,
  handleChangeSignEULA: () => void,
}

interface State {}

class SignUserAgreement extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
  }

  handleStepPrevious = (e) => {
    e.preventDefault();
    this.props.handlePrevious();
  }

  handleStepComplete = async (e) => {
    e.preventDefault();

    this.props.handleContinue();
  }

  render() {
    const {
      hasSigned,
      handleContinue,
      handlePrevious,
      handleChangeSignEULA,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>
            Sign Up- Organization Info
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-10">
            <div className="text-center pb-4 mb-2">
              <h2><b>Next, tell us about your organization.</b></h2>
            </div>
            <div className="embed-responsive embed-responsive-16by9">
              <iframe className="embed-responsive-item" src={EULA} title="EULA Agreement" />
            </div>
            <SignaturePad acceptEULA={hasSigned} handleChangeAcceptEULA={this.props.handleChangeSignEULA} />
            <div className="d-flex">
              <button type="button" className="btn btn-outline-danger mt-5" onClick={this.handleStepPrevious}>Previous Step</button>
              <button type="button" className="ml-auto btn btn-primary mt-5" onClick={this.handleStepComplete}>Continue</button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(SignUserAgreement);
