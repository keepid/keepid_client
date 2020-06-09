import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import getServerURL from '../serverOverride';
import DocumentViewer from "./DocumentViewer";

interface Props {}

interface State {
    formQuestions: [string, string][] | undefined,
    formAnswers: any,
    pdfApplication: File | undefined,
    buttonState: string
}

class ApplicationForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      formQuestions: undefined,
      formAnswers: {},
      pdfApplication: undefined,
      buttonState: '',
    };
    this.handleChangeFormValue = this.handleChangeFormValue.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const {
      formAnswers,
    } = this.state;
    fetch(`${getServerURL()}/get-application-questions`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({}),
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

  onSubmit(event: any) {
    event.preventDefault();
    const {
      formAnswers,
    } = this.state;

    this.setState({ buttonState: 'running' });

    fetch(`${getServerURL()}/fill-application`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(formAnswers),
    }).then((response) => response.blob())
        .then((responseBlob) => {
          const pdfApplication = new File([responseBlob], "Filename", { type: 'application/pdf' });
          this.setState({ pdfApplication });
        });
  }

  render() {
    const {
      pdfApplication,
      formQuestions,
    } = this.state;
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
        {formQuestions ? (<form onSubmit={this.onSubmit}>
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
            Submit
            <div className="ld ld-ring ld-spin" />
          </button>
        </form>) : <div />}
        { pdfApplication ? (
            <div>
              <DocumentViewer pdfFile={pdfApplication} />
              <button>Submit Final PDF</button>
            </div>
              )
              : <div />}
      </div>
    );
  }
}

export default ApplicationForm;
