import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import getServerURL from '../../serverOverride';
import DocumentViewer from './DocumentViewer';
import PDFType from '../../static/PDFType';
import SignaturePad from '../../lib/SignaturePad';
import 'react-datepicker/dist/react-datepicker.css';
// import {Simulate} from "react-dom/test-utils";
// import submit = Simulate.submit;

interface Props {
  alert: any,
  applicationId: string,
  applicationFilename: string,
}

interface State {
  formQuestions: any[] | undefined,
  formAnswers: any,
  pdfApplication: File | undefined,
  buttonState: string,
  submitSuccessful: boolean,
  currentPage: number,
  numPages: number,
  startDate: Date
}

// Source: https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','); // const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]); let n = bstr.length; const
    u8arr = new Uint8Array(n);
  while (n >= 0) {
    n -= 1;
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: 'image/png' });
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
      currentPage: 0,
      numPages: 0,
      startDate: new Date(),
    };
    this.handleChangeFormValueTextField = this.handleChangeFormValueTextField.bind(this);
    this.handleChangeFormValueRadioButton = this.handleChangeFormValueRadioButton.bind(this);
    this.handleChangeFormValueCheckBox = this.handleChangeFormValueCheckBox.bind(this);
    this.handleChangeFormValueListBox = this.handleChangeFormValueListBox.bind(this);
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
        const { fields } = responseJSON;
        this.setState({ formQuestions: fields });
        fields.forEach((entry) => {
          formAnswers[entry.fieldName] = entry.fieldDefaultValue;
        });
        this.setState({ formAnswers });
      });
  }

  handleChangeFormValueTextField(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { id } = event.target;
    const { value } = event.target;
    formAnswers[id] = value;
    this.setState({ formAnswers });
  }

  handleChangeFormValueCheckBox(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { id } = event.target;
    const value : boolean = event.target.checked;
    formAnswers[id] = value;
    this.setState({ formAnswers });
  }

  handleChangeFormValueRadioButton(event: any) {
    const {
      formAnswers,
    } = this.state;
    const { name } = event.target;
    const { value } = event.target;
    formAnswers[name] = value;
    this.setState({ formAnswers });
  }

  handleChangeFormValueListBox(event: any) {
    const {
      formAnswers,
    } = this.state;
    const values : string[] = Array.from(event.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    const { id } = event.target;
    formAnswers[id] = values;
    this.setState({ formAnswers });
  }

  handleChangeDate = (date) => {
    this.setState({
      startDate: date,
    });
  };

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
      formData.append('file', pdfApplication);
      const signature = dataURLtoBlob(this.signaturePad.toDataURL());
      // const signatureFile = new File(this.signaturePad.toDataURL(), "signature", { type: "image/png" });
      formData.append('signature', signature);
      formData.append('pdfType', PDFType.APPLICATION);
      fetch(`${getServerURL()}/upload-signed-pdf`, {
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

  progressBarFill() {
    const { formQuestions, formAnswers } = this.state;
    const total = (formQuestions) ? formQuestions.length : 0;
    let answered = 0;
    Object.keys(formAnswers).forEach((questionId) => {
      if (formAnswers[questionId]) answered += 1;
    });
    return (total === 0) ? 100 : Math.round((answered / total) * 100);
  }

  render() {
    const {
      pdfApplication,
      formQuestions,
      formAnswers,
      submitSuccessful,
      currentPage,
      numPages,
      startDate,
    } = this.state;

    if (submitSuccessful) {
      return (<Redirect to="/home" />);
    }

    let bodyElement;
    const fillAmt = this.progressBarFill();
    if (pdfApplication) {
      bodyElement = (
        <div className="col-lg-10 col-md-12 col-sm-12 mx-auto">
          <div className="jumbotron jumbotron-fluid bg-white pb-0 text-center">
            <div className="progress mb-4">
              <div className="progress-bar active" role="progressbar" aria-valuenow={fillAmt} aria-valuemin={0} aria-valuemax={100} style={{ width: `${fillAmt}%` }}>{`${fillAmt}%`}</div>
            </div>
            <div className="container">
              <h2>Review and sign to complete your form</h2>
              <p>Finally, sign the agreement and click submit when complete.</p>
            </div>
          </div>

          <DocumentViewer pdfFile={pdfApplication} />
          <div className="d-flex justify-content-center pt-5">
            <div className="container border px-5 col-lg-10 col-md-10 col-sm-12">
              <div className="pt-5 pb-3">I agree to all terms and conditions in the agreement above.</div>
              <SignaturePad ref={(ref) => { this.signaturePad = ref; }} />
              <div className="d-flex text-center my-5">
                <button type="button" className="btn btn-outline-primary mr-auto">Previous Step</button>
                <span>
                  <p>
                    <b>
                      Page
                      {' '}
                      {currentPage}
                      {' '}
                      of
                      {' '}
                      {numPages}
                    </b>
                  </p>
                </span>
                <button type="submit" className="ml-auto btn btn-primary ml-auto" onClick={this.onSubmitPdfApplication}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (formQuestions) {
      bodyElement = (
        <div className="col-lg-10 col-md-12 col-sm-12 mx-auto">
          <div className="jumbotron jumbotron-fluid bg-white pb-0 text-center">
            <div className="progress mb-4">
              <div className="progress-bar" role="progressbar" aria-valuenow={fillAmt} aria-valuemin={0} aria-valuemax={100} style={{ width: `${fillAmt}%` }}>{`${fillAmt}%`}</div>
            </div>
            <div className="container col-lg-10 col-md-10 col-sm-12">
              <h2>Application Form Name</h2>
              <p>Sample description of what this form is about. Or instructions for the form can go here.</p>
            </div>
          </div>
          <div className="container border px-5 col-lg-10 col-md-10 col-sm-12">
            <form onSubmit={this.onSubmitFormQuestions}>
              {formQuestions.map(
                (entry) => (
                  <div className="my-5">
                    {
                      (() => {
                        if (entry.fieldType === 'TextField') {
                          return (
                            <div className="mt-2 mb-2">
                              <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
                                {entry.fieldQuestion}
                              </label>
                              <input
                                type="text"
                                className="form-control form-purple mt-1"
                                id={entry.fieldName}
                                placeholder={entry.fieldName}
                                onChange={this.handleChangeFormValueTextField}
                                required
                              />
                              <small className="form-text text-muted mt-1">Please complete this field.</small>
                            </div>
                          );
                        }

                        if (entry.fieldType === 'CheckBox') {
                          const temp = entry.fieldValueOptions;
                          return (
                            <div className="mt-2 mb-2">
                              <div className="checkbox-question">
                                <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
                                  {entry.fieldQuestion}
                                  <small className="form-text text-muted mt-1">Please complete this field.</small>
                                </label>

                                {temp.map((value) => (
                                  <div className="checkbox-option">
                                    <div className="custom-control custom-checkbox mx-2">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input mr-2"
                                        id={entry.fieldName}
                                        onChange={this.handleChangeFormValueCheckBox}
                                        name={entry.fieldName}
                                      />
                                      <label className="custom-control-label" htmlFor={entry.fieldName}>{value}</label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (entry.fieldType === 'RadioButton') {
                          const temp = entry.fieldValueOptions;
                          return (
                            <div className="mt-2 mb-2">
                              <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
                                {entry.fieldQuestion}
                                <small className="form-text text-muted mt-1">Please complete this field.</small>
                              </label>

                              {temp.map((value) => (
                                <div className="custom-control custom-radio">
                                  <input
                                    type="radio"
                                    className="custom-control-input"
                                    id={value}
                                    checked={formAnswers[entry.fieldName] === value}
                                    value={value}
                                    name={entry.fieldName}
                                    onChange={this.handleChangeFormValueRadioButton}
                                    required
                                  />
                                  <label className="custom-control-label" htmlFor={value}>{value}</label>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (entry.fieldType === 'ComboBox') {
                          const temp = entry.fieldValueOptions;
                          return (
                            <div className="dropdown-question">
                              <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
                                {entry.fieldQuestion}
                                <small className="form-text text-muted mt-1">Please complete this field.</small>
                              </label>

                              <select id={entry.fieldName} onChange={this.handleChangeFormValueTextField} className="custom-select" required>
                                <option selected disabled value="">Please select your choice ...</option>
                                {temp.map((value) => (
                                  <option value={value}>{value}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (entry.fieldType === 'ListBox') {
                          const temp = entry.fieldValueOptions;
                          return (
                            <div className="multiple-dropdown-question">
                              <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
                                {entry.fieldQuestion}
                                <small className="form-text text-muted mt-1">Please complete this field.</small>
                              </label>

                              <select id={entry.fieldName} onChange={this.handleChangeFormValueListBox} className="custom-select" multiple required>
                                <option selected disabled value="">Please select your choice(s) ...</option>
                                {temp.map((value) => (
                                  <option value={value}>{value}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (entry.fieldType === 'DateField') {
                          return (
                            <div className="date-question">
                              <label htmlFor="date" className="w-100 font-weight-bold">Date</label>
                              <DatePicker
                                id="date"
                                selected={startDate}
                                onChange={this.handleChangeDate}
                                className="form-control form-purple mt-1"
                              />
                              <small className="form-text text-muted mt-1">Please complete this field.</small>
                            </div>
                          );
                        }
                        return <div />;
                      })()
                    }
                  </div>
                ),
              )}
              <button type="submit" className={`mt-2 btn btn-success loginButtonBackground ld-ext-right ${this.state.buttonState}`}>
                Submit Form Answers
                <div className="ld ld-ring ld-spin" />
              </button>
              <div className="d-flex text-center my-5">
                <button type="button" className="btn btn-outline-primary mr-auto">Previous Step</button>
                <span>
                  <p>
                    <b>
                      Page
                      {' '}
                      {currentPage}
                      {' '}
                      of
                      {' '}
                      {numPages}
                    </b>
                  </p>
                </span>
                <button type="submit" className="ml-auto btn btn-primary ml-auto">Continue</button>
              </div>
            </form>
          </div>
        </div>
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
