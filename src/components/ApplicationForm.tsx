import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import getServerURL from '../serverOverride';
import DocumentViewer from './DocumentViewer';
import Role from '../static/Role';
import PDFType from '../static/PDFType';
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
        formQuestionsCombined.map((entry) => (formAnswers[entry[0]] = ''));
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
      formData.append('file', pdfApplication, pdfApplication.name);
      formData.append('pdfType', PDFType.APPLICATION);
      fetch(`${getServerURL()}/upload`, {
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

  render() {
    const {
      pdfApplication,
      formQuestions,
      submitSuccessful,
    } = this.state;

    if (submitSuccessful) {
      return (<Redirect to="/home" />);
    }

    let bodyElement;
    if (pdfApplication) {
      bodyElement = (
        <div>
          <DocumentViewer pdfFile={pdfApplication} />
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
