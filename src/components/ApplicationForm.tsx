import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import getServerURL from '../serverOverride';
import DocumentViewer from './DocumentViewer';
import PDFType from '../static/PDFType';
import SignaturePad from "../lib/react-typescript-signature-pad";
// import {Simulate} from "react-dom/test-utils";
// import submit = Simulate.submit;

interface Props {
    alert: any,
    applicationId: string,
    applicationFilename: string,
}

interface State {
    formQuestions: [string, string][] | undefined,
    formAnswers: any,
    pdfApplication: File | undefined,
    buttonState: string,
    submitSuccessful: boolean,
}

class ApplicationForm extends Component<Props, State> {
  signaturePad: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      formQuestions: undefined,
      formAnswers: {},
      pdfApplication: undefined,
      buttonState: '',
      submitSuccessful: false,
    };
    this.handleChangeFormValue = this.handleChangeFormValue.bind(this);
    this.onSubmitFormQuestions = this.onSubmitFormQuestions.bind(this);
    this.onSubmitPdfApplication = this.onSubmitPdfApplication.bind(this);
  }

  componentDidMount() {
    const {
      applicationId,
    } = this.props;
    const {
      formAnswers,
    } = this.state;
    fetch(`${getServerURL()}/get-application-questions`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        applicationId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          fieldNames,
          fieldQuestions,
        } = JSON.parse(responseJSON);
        const fieldNamesArray : string[] = fieldNames;
        const fieldQuestionsArray : string[] = fieldQuestions;
        console.log(responseJSON);
        const numFields = fieldNamesArray.length;
        const formQuestionsCombined : [string, string][] = new Array(numFields);
        for (let j = 0; j < numFields; j += 1) {
          formQuestionsCombined[j] = [fieldNamesArray[j], fieldQuestionsArray[j]];
        }
        this.setState({ formQuestions: formQuestionsCombined });
        // eslint-disable-next-line
        formQuestionsCombined.map((entry) => { formAnswers[entry[0]] = ''; });
        this.setState({ formAnswers });
      });
  }

  handleChangeFormValue(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { id } = event.target;
    const { value } = event.target;
    formAnswers[id] = value;
    this.setState({ formAnswers });
  }

  onSubmitFormQuestions(event: any) {
    event.preventDefault();
    const {
      applicationId,
      applicationFilename,
    } = this.props;
    const {
      formAnswers,
    } = this.state;

    this.setState({ buttonState: 'running' });

    fetch(`${getServerURL()}/fill-application`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        applicationId,
        formAnswers,
      }),
    }).then((response) => response.blob())
      .then((responseBlob) => {
        const pdfFile = new File([responseBlob], applicationFilename, { type: 'application/pdf' });
        this.setState({ pdfApplication: pdfFile });
      });
  }

  onSubmitPdfApplication(event: any) {
    const {
      pdfApplication,
    } = this.state;
    if (pdfApplication) {
      const formData = new FormData();
      console.log(pdfApplication);
      formData.append('file', pdfApplication);
      const signature = this.dataURLtoBlob(this.signaturePad.toDataURL());
      // const signatureFile = new File(this.signaturePad.toDataURL(), "signature", { type: "image/png" });
      formData.append('signature', signature);
      formData.append('pdfType', PDFType.APPLICATION);
      fetch(`${getServerURL()}/upload-pdf-signed`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then((response) => (response.json()))
        .then((responseJSON) => {
          this.setState({ submitSuccessful: true });
          this.props.alert.show('Successfully Submitted Application');
        });
    }
  }

  // Source: https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: 'image/png'});
  }

  render() {
    const {
      pdfApplication,
      formQuestions,
      submitSuccessful,
    } = this.state;

    //const signaturePad = new SignaturePad({});
    //this.signaturePad = signaturePad;

    if (submitSuccessful) {
      return (<Redirect to="/home" />);
    }

    let bodyElement;
    if (pdfApplication) {
      bodyElement = (
        <div>
          <DocumentViewer pdfFile={pdfApplication} />
          <SignaturePad ref={(ref) => { this.signaturePad = ref; }} />
          <button onClick={this.onSubmitPdfApplication} type="button">Submit Final Application</button>
        </div>
      );
    } else if (formQuestions) {
      bodyElement = (
        <form onSubmit={this.onSubmitFormQuestions}>
          {formQuestions.map(
            (entry) => (
              <div className="mt-2 mb-2">
                <label htmlFor={entry[0]} className="w-100 font-weight-bold">
                  {entry[1]}
                  <input
                    type="text"
                    className="form-control form-purple mt-1"
                    id={entry[0]}
                    placeholder="Enter response here"
                    onChange={this.handleChangeFormValue}
                    required
                  />
                </label>
              </div>
            ),
          )}
          <button type="submit" className={`mt-2 btn btn-success loginButtonBackground ld-ext-right ${this.state.buttonState}`}>
            Submit Form Answers
            <div className="ld ld-ring ld-spin" />
          </button>
        </form>
      );
    } else {
      bodyElement = (<div />);
    }
    return (
      <div className="container">
        <Helmet>
          <title>Fill Application</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron jumbotron-fluid bg-white pb-0">
          <div className="container">
            <h1 className="display-4">Application Questions</h1>
            <p className="lead">Fill out your application here.</p>
          </div>
        </div>
        {bodyElement}
        <Link to="/applications">
          <button type="button" className="btn btn-outline-success">
            Back
          </button>
        </Link>
      </div>
    );
  }
}

export default withAlert()(ApplicationForm);
