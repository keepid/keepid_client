import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import EULA from '../../static/EULA.pdf';
import SignaturePad from '../../lib/react-typescript-signature-pad';

interface Props {
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
    const { hasSigned, handleContinue } = this.props;

    if (hasSigned) {
      handleContinue();
    } else {
      this.props.alert.show('Please sign the EULA');
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      hasSigned,
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
          <div className="col-md-12">
            <div className="text-center pb-4 mb-2">
              <h2><b>Next, review and sign our End User Agreement.</b></h2>
            </div>
            <div className="embed-responsive embed-responsive-16by9">
              <iframe className="embed-responsive-item" src={EULA} title="EULA Agreement" />
            </div>
            <div className="d-flex justify-content-center pt-5">
              <div className="col-md-8">
                <div className="pb-3">I agree to all terms and conditions to the EULA above.</div>
                <SignaturePad acceptEULA={hasSigned} handleChangeAcceptEULA={handleChangeSignEULA} />
              </div>
            </div>
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
