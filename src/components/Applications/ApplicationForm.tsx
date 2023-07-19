import 'react-datepicker/dist/react-datepicker.css';

import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone-uploader';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import uuid from 'react-uuid';

import SignaturePad from '../../lib/SignaturePad';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import DocumentViewer from '../Documents/DocumentViewer';
import DropzoneUploader from '../Documents/DropzoneUploader';

interface Field {
  fieldID: string; // Unique identifier id from frontend
  fieldName: string; // Unique identifier name from backend
  fieldType: string;
  fieldValueOptions: string[];
  fieldDefaultValue: any;
  fieldIsRequired: boolean;
  fieldNumLines: number;
  fieldIsMatched: boolean;
  fieldQuestion: string;
}

interface Props {
  alert: any;
  applicationId: string;
  applicationFilename: string;
  clientUsername: string;
}

interface State {
  fields: Field[] | undefined;
  formAnswers: { [fieldName: string]: any };
  pdfApplication: File | undefined;
  buttonState: string;
  title: string;
  description: string;
  submitSuccessful: boolean;
  currentPage: number;
  numPages: number;
  formError: boolean;
  // importApplicationDataFile: File | undefined;
}

const MAX_Q_PER_PAGE = 10;

class ApplicationForm extends Component<Props, State> {
  signaturePad: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: undefined,
      formAnswers: {},
      pdfApplication: undefined,
      buttonState: '',
      title: '',
      description: '',
      submitSuccessful: false,
      currentPage: 1,
      numPages: 1,
      formError: false,
      // importApplicationDataFile: undefined,
    };
  }

  componentDidMount() {
    const { applicationId, clientUsername } = this.props;
    const { formAnswers } = this.state;
    fetch(`${getServerURL()}/get-application-questions`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        applicationId,
        clientUsername,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'SUCCESS') {
          const { fields, title, description } = responseJSON;
          // Get every field and give it a unique ID
          for (let i = 0; i < fields.length; i += 1) {
            fields[i].fieldID = uuid();
            const entry = fields[i];
            if (entry.fieldType === 'DateField') {
              // Need to update default date value with the local date on the current computer
              formAnswers[entry.fieldName] = new Date();
            } else {
              formAnswers[entry.fieldName] = entry.fieldDefaultValue;
            }
          }
          this.setState({
            fields,
            title,
            description,
            formAnswers,
            numPages:
              fields.length === 0
                ? 1
                : Math.ceil(fields.length / MAX_Q_PER_PAGE),
          });
        } else {
          this.setState({
            formError: true,
          });
        }
      });
  }

  handleContinue = (e: any): void => {
    e.preventDefault();
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage + 1 }),
      () => window.scrollTo(0, 0),
    );
  };

  handlePrevious = (e: any): void => {
    e.preventDefault();
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage - 1 }),
      () => window.scrollTo(0, 0),
    );
  };

  handleImportApplicationData = (fileObject) => {
    // this.setState({ importApplicationDataFile: fileObject.file });

    // Refresh Application Load
  }

  handleChangeFormValueTextField = (event: any) => {
    const { formAnswers } = this.state;
    const { id, value } = event.target;
    formAnswers[id] = value;
    this.setState({ formAnswers });
  };

  handleChangeFormValueCheckBox = (event: any) => {
    const { formAnswers } = this.state;
    const { id } = event.target;
    const value: boolean = event.target.checked;
    formAnswers[id] = value;
    this.setState({ formAnswers });
  };

  handleChangeFormValueRadioButton = (event: any) => {
    const { formAnswers } = this.state;
    const { name, value } = event.target;
    formAnswers[name] = value;
    this.setState({ formAnswers });
  };

  handleChangeFormValueListBox = (event: any) => {
    const { formAnswers } = this.state;
    const values: string[] = Array.from(
      event.target.selectedOptions,
      (option: HTMLOptionElement) => option.value,
    );
    const { id } = event.target;
    formAnswers[id] = values;
    this.setState({ formAnswers });
  };

  handleChangeFormValueDateField = (date: any, id: string) => {
    const { formAnswers } = this.state;
    formAnswers[id] = date;
    this.setState({ formAnswers });
  };

  getTextField = (entry: Field, formAnswers: { [fieldName: string]: any }) => (
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
        value={formAnswers[entry.fieldName]}
        required={entry.fieldIsRequired}
        readOnly={entry.fieldIsMatched}
      />
      {entry.fieldIsRequired ? (
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      ) : (
        <div />
      )}
    </div>
  );

  getMultilineTextField = (
    entry: Field,
    formAnswers: { [fieldName: string]: any },
  ) => (
    <div className="mt-2 mb-2">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
      </label>
      <textarea
        className="form-control form-purple mt-1"
        id={entry.fieldName}
        placeholder={entry.fieldName}
        onChange={this.handleChangeFormValueTextField}
        value={formAnswers[entry.fieldName]}
        required={entry.fieldIsRequired}
        readOnly={entry.fieldIsMatched}
      />
      {entry.fieldIsRequired ? (
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      ) : (
        <div />
      )}
    </div>
  );

  getCheckBox = (entry: Field, formAnswers: { [fieldName: string]: any }) => (
    <div className="mt-2 mb-2">
      <div className="checkbox-question">
        <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
          {entry.fieldQuestion}
          <small className="form-text text-muted mt-1">
            Please complete this field.
          </small>
        </label>
        <div className="checkbox-option" key={entry.fieldValueOptions[0]}>
          <div className="custom-control custom-checkbox mx-2">
            <input
              type="checkbox"
              className="custom-control-input mr-2"
              id={entry.fieldName}
              onChange={this.handleChangeFormValueCheckBox}
              checked={formAnswers[entry.fieldName]}
              required={entry.fieldIsRequired}
              readOnly={entry.fieldIsMatched}
            />
            <label className="custom-control-label" htmlFor={entry.fieldName}>
              {entry.fieldValueOptions[0]}
            </label>
            {entry.fieldIsRequired ? (
              <small className="form-text text-muted mt-1">
                Please complete this field.
              </small>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  getRadioButton = (
    entry: Field,
    formAnswers: { [fieldName: string]: any },
  ) => (
    <div className="mt-2 mb-2">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      </label>
      {entry.fieldValueOptions.map((value) => (
        <div
          className="custom-control custom-radio"
          key={`${entry.fieldName}_${value}`}
        >
          <input
            type="radio"
            className="custom-control-input"
            id={`${entry.fieldName}_${value}`}
            name={entry.fieldName}
            checked={formAnswers[entry.fieldName] === value}
            value={value}
            onChange={this.handleChangeFormValueRadioButton}
            required={entry.fieldIsRequired}
            readOnly={entry.fieldIsMatched}
          />
          <label
            className="custom-control-label"
            htmlFor={`${entry.fieldName}_${value}`}
          >
            {value}
          </label>
        </div>
      ))}
    </div>
  );

  getComboBox = (entry: Field, formAnswers: { [fieldName: string]: any }) => (
    <div className="dropdown-question">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      </label>

      <select
        id={entry.fieldName}
        onChange={this.handleChangeFormValueTextField}
        className="custom-select"
        required={entry.fieldIsRequired}
      >
        <option selected disabled value="">
          Please select your choice ...
        </option>
        {entry.fieldValueOptions.map((value) => (
          <option value={value} key={`${entry.fieldName}_${value}`}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );

  getListBox = (entry: Field, formAnswers: { [fieldName: string]: any }) => (
    <div className="multiple-dropdown-question">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      </label>
      <select
        id={entry.fieldName}
        onChange={this.handleChangeFormValueListBox}
        className="custom-select"
        multiple
        required={entry.fieldIsRequired}
      >
        <option selected disabled value="">
          Please select your choice(s) ...
        </option>
        {entry.fieldValueOptions.map((value) => (
          <option value={value} key={`${entry.fieldName}_${value}`}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );

  getDateField = (entry: Field, formAnswers: { [fieldName: string]: any }) => (
    <div className="date-question">
      <label htmlFor="date" className="w-100 font-weight-bold">
        Date
      </label>
      <DatePicker
        id={entry.fieldName}
        selected={new Date(formAnswers[entry.fieldName])}
        onChange={(date) =>
          this.handleChangeFormValueDateField(date, entry.fieldName)
        }
        className="form-control form-purple mt-1"
        required={entry.fieldIsRequired}
        readOnly={entry.fieldIsMatched}
      />
      <small className="form-text text-muted mt-1">
        Please complete this field.
      </small>
    </div>
  );

  toDateString = (date: Date) => {
    // Source: https://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();
    const dateString = [
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
      date.getFullYear(),
    ].join('/');
    return dateString;
  };

  onSubmitFormAnswers = (event: any) => {
    event.preventDefault();
    const { applicationId, applicationFilename, clientUsername } = this.props;
    const { fields, formAnswers } = this.state;

    if (fields) {
      for (let i = 0; i < fields.length; i += 1) {
        const entry = fields[i];
        if (entry.fieldType === 'DateField') {
          const date = formAnswers[entry.fieldName];
          formAnswers[entry.fieldName] = this.toDateString(date);
        }
      }
    }

    this.setState({ buttonState: 'running' });

    fetch(`${getServerURL()}/fill-application`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        applicationId,
        clientUsername,
        formAnswers,
      }),
    })
      .then((response) => response.blob())
      .then((responseBlob) => {
        const pdfFile = new File([responseBlob], applicationFilename, {
          type: 'application/pdf',
        });
        this.setState(
          {
            pdfApplication: pdfFile,
            buttonState: '',
          },
          () => window.scrollTo(0, 0),
        );
      });
  };

  // Source: https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n >= 0) {
      n -= 1;
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: 'image/png' });
  };

  onSubmitPdfApplication = (event: any) => {
    const { pdfApplication } = this.state;
    const { alert, clientUsername } = this.props;
    if (pdfApplication) {
      const formData = new FormData();
      formData.append('file', pdfApplication);
      const signature = this.dataURLtoBlob(this.signaturePad.toDataURL());
      // const signatureFile = new File(this.signaturePad.toDataURL(), "signature", { type: "image/png" });
      formData.append('signature', signature);
      formData.append('pdfType', PDFType.COMPLETED_APPLICATION);
      formData.append('clientUsername', clientUsername);
      fetch(`${getServerURL()}/upload-signed-pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          this.setState({ submitSuccessful: true });
          alert.show('Successfully Completed PDF Application');
        });
    }
  };

  progressBarFill = (): number => {
    const { fields, formAnswers } = this.state;
    const total = fields ? fields.length : 0;
    let answered = 0;
    Object.keys(formAnswers).forEach((questionId) => {
      const ans = formAnswers[questionId];
      if (ans && ans !== 'Off' && ans !== 'false') {
        answered += 1;
      }
    });
    return total === 0 ? 100 : Math.round((answered / total) * 100);
  };

  getApplicationBody = () => {
    const {
      pdfApplication,
      fields,
      formAnswers,
      title,
      description,
      currentPage,
      buttonState,
      numPages,
    } = this.state;
    let bodyElement;
    const fillAmt = (currentPage / numPages) * 100;
    // const fillAmt = this.progressBarFill();
    const qStartNum = (currentPage - 1) * MAX_Q_PER_PAGE;
    if (pdfApplication) {
      // If the user has submitted their answers display the finished PDF application
      bodyElement = (
        <div className="col-lg-10 col-md-12 col-sm-12 mx-auto">
          <div className="jumbotron jumbotron-fluid bg-white pb-0 text-center">
            <div className="container">
              <h2>Review and sign to complete your form</h2>
              <p>Finally, sign the document and click submit when complete.</p>
            </div>
          </div>

          <DocumentViewer pdfFile={pdfApplication} />
          <div className="d-flex justify-content-center pt-5">
            <div className="container border px-5 col-lg-10 col-md-10 col-sm-12">
              <div className="pt-5 pb-3">
                I agree to all terms and conditions in the form document above.
              </div>
              <SignaturePad
                ref={(ref) => {
                  this.signaturePad = ref;
                }}
              />
              <div className="d-flex text-center my-5">
                <Button
                  type="submit"
                  variant="primary"
                  className="ml-auto"
                  onClick={this.onSubmitPdfApplication}
                >
                  Submit PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (fields) {
      // If the user has not yet answered the questions, display the fields
      bodyElement = (
        <div className="col-lg-10 col-md-12 col-sm-12 mx-auto">
          <div className="jumbotron jumbotron-fluid bg-white pb-0 text-center">
            <div className="progress mb-4">
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={fillAmt}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${fillAmt}%`}
                style={{ width: `${fillAmt}%` }}
              />
            </div>
            <div className="container col-lg-10 col-md-10 col-sm-12">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </div>
          <div className="container border px-5 col-lg-10 col-md-10 col-sm-12">
            {currentPage === 1 ? (
<Dropzone
  onSubmit={this.handleImportApplicationData}
  maxFiles={1}
  accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  inputContent="Import Data for Application"
  submitButtonContent="Import"
/>
            ) : <div />}
            <form onSubmit={this.onSubmitFormAnswers}>
              {fields.map((entry, index) => {
                if (index < qStartNum || index >= qStartNum + MAX_Q_PER_PAGE) return null;
                return (
                  <div className="my-5" key={entry.fieldID}>
                    {(() => {
                      if (entry.fieldType === 'ReadOnlyField') {
                        // TODO: Make the readOnly fields show and be formatted properly
                        return <div />;
                      }
                      if (entry.fieldType === 'TextField') {
                        return this.getTextField(entry, formAnswers);
                      }
                      if (entry.fieldType === 'MultilineTextField') {
                        return this.getMultilineTextField(entry, formAnswers);
                      }
                      if (entry.fieldType === 'CheckBox') {
                        return this.getCheckBox(entry, formAnswers);
                      }
                      if (entry.fieldType === 'RadioButton') {
                        return this.getRadioButton(entry, formAnswers);
                      }
                      if (entry.fieldType === 'ComboBox') {
                        return this.getComboBox(entry, formAnswers);
                      }
                      if (entry.fieldType === 'ListBox') {
                        return this.getListBox(entry, formAnswers);
                      }
                      if (entry.fieldType === 'DateField') {
                        return this.getDateField(entry, formAnswers);
                      }
                      return <div />;
                    })()}
                  </div>
                );
              })}

              <div className="row justify-content-between text-center my-5">
                <div className="col-md-2 pl-0">
                  {currentPage === 1 ? null : (
                    <button
                      type="button"
                      className="mr-auto btn btn-outline-primary"
                      onClick={this.handlePrevious}
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="col-md-4 text-center my-1">
                  <p>
                    <b>
                      {'Page '}
                      {currentPage}
                      {' of '}
                      {numPages}
                    </b>
                  </p>
                </div>
                <div className="col-md-2 mr-xs-3 mr-sm-0">
                  {currentPage !== numPages ? (
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={this.handleContinue}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      className={`ld-ext-right ${buttonState}`}
                      onClick={this.onSubmitFormAnswers}
                    >
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      // If the questions are still loading
      bodyElement = <div />;
    }
    return bodyElement;
  };

  render() {
    const { alert, clientUsername } = this.props;

    const { submitSuccessful, formError } = this.state;

    if (submitSuccessful) {
      return <Redirect to="/applications" />;
    }

    const bodyElement = this.getApplicationBody();
    return (
      <div className="container">
        <Helmet>
          <title>Fill Application</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="ml-5 mt-3">
          <div className="alert alert-primary">You are currently filling out this application on behalf of {clientUsername}.</div>
          <Link to="/applications">
            <button type="button" className="btn btn-primary">
              Back
            </button>
          </Link>
        </div>
        {bodyElement}
        {formError ? (
          <div className="p-5">There was an error loading this form.</div>
        ) : null}
      </div>
    );
  }
}

export default withAlert()(ApplicationForm);
