/* eslint-disable */

import 'react-datepicker/dist/react-datepicker.css';

import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import { Helmet } from 'react-helmet';
import { Link, Redirect } from 'react-router-dom';
import uuid from 'react-uuid';
import { Button } from 'react-bootstrap';

import SignaturePad from '../../lib/SignaturePad';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import DocumentViewer from '../Documents/DocumentViewer';
import { SingleEntryPlugin } from 'webpack';
import { FormattedDisplayName } from 'react-intl';


interface Field {
  fieldID: string, // Unique identifier id from frontend
  fieldName: string, // Unique identifier name from backend
  fieldType: string,
  fieldValueOptions: string[],
  fieldDefaultValue: any,
  fieldIsRequired: boolean,
  fieldNumLines: number,
  fieldIsMatched: boolean,
  fieldQuestion: string,
  fieldIsCorrect: boolean
}

interface Props {
  alert: any,
  applicationId: string,
  applicationFilename: string,
}

interface State {
  fields: Field[] | undefined,
  formAnswers: { [fieldName: string]: any },
  pdfApplication: File | undefined,
  buttonState: string,
  title: string,
  description: string,
  submitSuccessful: boolean,
  currentPage: number,
  numPages: number,
  formError: boolean,
  continueClicked: boolean,
  isSubsection: boolean,
  numQOnPage: number[],
  titleArray: string[],
  descriptionArray: string[]
}

const MAX_Q_PER_PAGE = 5;

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
      continueClicked: false,
      isSubsection: false,
      numQOnPage: [],
      titleArray: [],
      descriptionArray: []
    };
  }

  componentDidMount() {
    const {
      applicationId,
    } = this.props;
    const {
      formAnswers,
    } = this.state;
    const JSONresponse = require('./application_birth.json');
    const newExample = require('./drivers_license.json');
    const { status } = JSONresponse;
    //make API call here to get application questions. newExample currently hardcoded 
    //but is in the correct json format
      if (status === 'SUCCESS') {
        // const {
        //   fields,
        //   title,
        //   description,
        // } = JSONresponse;
        //const {fields} = JSONresponse;


        //SUBSECTIONS

        if (newExample.body['subsections'] != null){
          var currFields : Field[] = [];
          var currTitles : string[] = [];
          var currDescriptions : string[] = [];
          var currentNumQOnPage : number[] = [];
          const {description,title} = newExample.metadata;
          for (var i = 0; i < newExample.body['subsections'].length; i++){
            currentNumQOnPage.push(newExample.body['subsections'][i]['questions'].length);
            currTitles.push(newExample.body['subsections'][i]['title'])
            currDescriptions.push(newExample.body['subsections'][i]['description'])
            console.log("LENGTH");
            console.log(newExample.body['subsections'][i]['questions'].length);
            for (var j = 0; j < newExample.body['subsections'][i]['questions'].length; j++){
              currFields.push(newExample.body['subsections'][i]['questions'][j])

              /* 

              trying to fix the form answers being undefined issue 

              */ 
              const entry = currFields[currFields.length - 1];
              if (entry.fieldType === 'DateField') {
                // Need to update default date value with the local date on the current computer
                formAnswers[entry.fieldName] = new Date();
              } else {
                formAnswers[entry.fieldName] = entry.fieldDefaultValue;
              }
            }
          }

          const fields = currFields;

          // Get every field and give it a unique ID
          for (let i = 0; i < fields.length; i += 1) {
            fields[i].fieldID = uuid();
          }

          this.setState({
            fields: currFields,
            title,
            description,
            formAnswers,
            numPages:
              newExample.body['subsections'].length,
            isSubsection: true,
            numQOnPage : currentNumQOnPage,
            titleArray : currTitles,
            descriptionArray : currDescriptions
          });

          
        } 
        else{
          const {questions} = newExample.body;
          const fields = questions;
          const {description,title} = newExample.metadata;
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
            /*
            if (fields[i].fieldIsRequired && formAnswers[entry.fieldName].length == 0){
              fields[i].fieldIsCorrect = false;
            } else {
              fields[i].fieldIsCorrect = true;
            }
            */
          }
          var curPages = (fields.length === 0) ? 1 : Math.ceil(fields.length / MAX_Q_PER_PAGE);
          this.setState({
            fields,
            title,
            description,
            formAnswers,
            numPages:
              curPages,
          });
        }
      } else {
        this.setState({
          formError: true,
        });
      }


  }

  handleContinue = (e: any): void => {
    // if anything in the form has a wrong answer/is empty, you should not be able to increment state
    const { fields, formAnswers, currentPage, continueClicked, numQOnPage, isSubsection } = this.state;
    this.setState(
      () => ({ continueClicked: true }),
    );
    var canContinue = true;
    if (fields) {
      if (isSubsection){
        var currSum = 0;
        for (var i = 0; i < currentPage - 1; i++){
          currSum += numQOnPage[i];
        }
        const qStartNum = currSum
        const qEndNum = qStartNum + numQOnPage[currentPage - 1];

        // check if there are 0 questions, if there are, do nothing

        if (numQOnPage[currentPage - 1] != 0){
          for (let i = qStartNum; i < qEndNum; i += 1) {
            const entry = fields[i];
            // text field check
            if (entry.fieldType == "TextField" && entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0) {
              canContinue = false;
              entry.fieldIsCorrect = false;
            }
    
            //multiline
            if (entry.fieldType == "MultilineTextField" && entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0) {
              canContinue = false;
              entry.fieldIsCorrect = false;
            }
    
            //check box
            if (entry.fieldType == "RadioButton" && entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off") {
              canContinue = false;
              entry.fieldIsCorrect = false;
            }
    
            //combobox
            if (entry.fieldType == "ComboBox" && entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off") {
              canContinue = false;
              entry.fieldIsCorrect = false;
            }
    
            //listbox
            if (entry.fieldType == "ListBox" && entry.fieldIsRequired && (formAnswers[entry.fieldName] == "Off" || formAnswers[entry.fieldName].length == 0 || (formAnswers[entry.fieldName].length == 1 && formAnswers[entry.fieldName][0].length == 0))) {
              canContinue = false;
              entry.fieldIsCorrect = false;
            }
    
          }
        }

      } 
      else{
        for (let i = MAX_Q_PER_PAGE * (currentPage - 1); i < MAX_Q_PER_PAGE * currentPage; i += 1) {
          const entry = fields[i];
          // text field check
          if (entry.fieldType == "TextField" && entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0) {
            canContinue = false;
            entry.fieldIsCorrect = false;
          }
  
          //multiline
          if (entry.fieldType == "MultilineTextField" && entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0) {
            canContinue = false;
            entry.fieldIsCorrect = false;
          }
  
          //check box
          if (entry.fieldType == "RadioButton" && entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off") {
            canContinue = false;
            entry.fieldIsCorrect = false;
          }
  
          //combobox
          if (entry.fieldType == "ComboBox" && entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off") {
            canContinue = false;
            entry.fieldIsCorrect = false;
          }
  
          //listbox
          if (entry.fieldType == "ListBox" && entry.fieldIsRequired && (formAnswers[entry.fieldName] == "Off" || formAnswers[entry.fieldName].length == 0 || (formAnswers[entry.fieldName].length == 1 && formAnswers[entry.fieldName][0].length == 0))) {
            canContinue = false;
            entry.fieldIsCorrect = false;
          }
  
        }
      }
      
    }

    if (canContinue){
      e.preventDefault();
      this.setState(
        (prevState) => ({ currentPage: prevState.currentPage + 1, continueClicked: false }),
        () => window.scrollTo(0, 0),
      );
    }

    else{
      //change the color to red for the bad ones
    }

    
  };

  handlePrevious = (e: any): void => {
    e.preventDefault();
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage - 1 }),
      () => window.scrollTo(0, 0),
    );
  };

  handleChangeFormValueTextField = (event: any) => {
    const { fields, formAnswers } = this.state;
    const { id, value } = event.target;
    var currCorrect = true;
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

  getTextField = (entry: Field, formAnswers: { [fieldName: string]: any }, continueClicked: boolean) => (
    <div className="mt-2 mb-2">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
      </label>
      <input
        type="text"
        className={(entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0 && continueClicked) ? "form-control form-red mt-1" : "form-control form-purple mt-1"}
        id={entry.fieldName}
        placeholder={entry.fieldName}
        onChange={this.handleChangeFormValueTextField}
        value={formAnswers[entry.fieldName]}
        required={entry.fieldIsRequired}
        readOnly={entry.fieldIsMatched}
      />
      {(entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0 && continueClicked) ? (
        <small className="form-text unfilled-text mt-1">
          This section cannot be blank. Please fill it
        </small>
      ) : (
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      )}
    </div>
  );

  getMultilineTextField = (
    entry: Field,
    formAnswers: { [fieldName: string]: any },
    continueClicked: boolean
  ) => (
    <div className="mt-2 mb-2">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
      </label>
      <textarea
        className={(entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0 && continueClicked) ? "form-control form-red mt-1" : "form-control form-purple mt-1"}
        id={entry.fieldName}
        placeholder={entry.fieldName}
        onChange={this.handleChangeFormValueTextField}
        value={formAnswers[entry.fieldName]}
        required={entry.fieldIsRequired}
        readOnly={entry.fieldIsMatched}
      />
      {(entry.fieldIsRequired && formAnswers[entry.fieldName].length == 0 && continueClicked) ? (
        <small className="form-text unfilled-text mt-1">
          This section cannot be blank.
        </small>
      ) : (
        <small className="form-text text-muted mt-1">
          Please complete this field.
        </small>
      )}
    </div>
  );

  getCheckBox = (entry: Field, formAnswers: { [fieldName: string ]: any }) => (
    <div className="mt-2 mb-2">
      <div className="checkbox-question">
        <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
          {entry.fieldQuestion}
      
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
    continueClicked: boolean
  ) => (
    <div className={(entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off" && continueClicked) ? "mt-2 mb-2 form-red" : "mt-2 mb-2"}>
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        {(entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off" && continueClicked) ? (
          <small className="form-text unfilled-text mt-1">
            Must select an option.
          </small>
        ) : (
          <small className="form-text text-muted mt-1">
            Please complete this field.
          </small>
        )}
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

  getComboBox = (entry: Field, formAnswers: { [fieldName: string]: any }, continueClicked: boolean) => (
    <div className="dropdown-question">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        {(entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off" && continueClicked) ? (
          <small className="form-text unfilled-text mt-1">
            Must select an option.
          </small>
        ) : (
          <small className="form-text text-muted mt-1">
            Please complete this field.
          </small>
        )}
      </label>

      <select
        id={entry.fieldName}
        onChange={this.handleChangeFormValueTextField}
        className={(entry.fieldIsRequired && formAnswers[entry.fieldName] == "Off" && continueClicked) ? "custom-select form-red" : "custom-select"} 
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

  getListBox = (entry: Field, formAnswers: { [fieldName: string]: any }, continueClicked: boolean) => (
    <div className="multiple-dropdown-question">
      <label htmlFor={entry.fieldName} className="w-100 font-weight-bold">
        {entry.fieldQuestion}
        {((formAnswers[entry.fieldName] == "Off" || formAnswers[entry.fieldName].length == 0 || (formAnswers[entry.fieldName].length == 1 && formAnswers[entry.fieldName][0].length == 0)) && continueClicked) ? (
          <small className="form-text unfilled-text mt-1">
            Must select an option(s).
          </small>
        ) : (
          <small className="form-text text-muted mt-1">
            Please complete this field.
          </small>
        )}
      </label>
      <select
        id={entry.fieldName}
        onChange={this.handleChangeFormValueListBox}
        className={((formAnswers[entry.fieldName] == "Off" || formAnswers[entry.fieldName].length == 0 || (formAnswers[entry.fieldName].length == 1 && formAnswers[entry.fieldName][0].length == 0)) && continueClicked) ? "custom-select form-red" : "custom-select"} 
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
      date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
    ].join('-');
    return dateString;
  };

  onSubmitFormAnswers = (event: any) => {
    event.preventDefault();
    const { applicationId, applicationFilename } = this.props;
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
    const { alert } = this.props;
    if (pdfApplication) {
      const formData = new FormData();
      formData.append('file', pdfApplication);
      const signature = this.dataURLtoBlob(this.signaturePad.toDataURL());
      // const signatureFile = new File(this.signaturePad.toDataURL(), "signature", { type: "image/png" });
      formData.append('signature', signature);
      formData.append('pdfType', PDFType.APPLICATION);
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
      continueClicked,
      isSubsection,
      numQOnPage,
      titleArray,
      descriptionArray
    } = this.state;
    console.log("STATEEE");
    console.log(this.state);
    let bodyElement;
    const fillAmt = (currentPage / numPages) * 100;
    // const fillAmt = this.progressBarFill();
    var currSum = 0;
    for (var i = 0; i < currentPage - 1; i++){
      currSum += numQOnPage[i];
    }
    const qStartNum = isSubsection ? currSum : (currentPage - 1) * MAX_Q_PER_PAGE;
    const qEndNum = isSubsection ? qStartNum + numQOnPage[currentPage - 1] : qStartNum + MAX_Q_PER_PAGE;
    const includeQuestions = isSubsection ? numQOnPage[currentPage - 1] != 0 : true;
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
            <div className="container px-5 col-lg-10 col-md-10 col-sm-12">
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
          <div className="container col-lg-10 col-md-10 col-sm-12">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
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
              <h2>{isSubsection ? titleArray[currentPage - 1] : title}</h2>
              <p>{isSubsection ? descriptionArray[currentPage - 1] : description}</p>
            </div>
          </div>
          <div className="container px-5 col-lg-10 col-md-10 col-sm-12">
            <form onSubmit={this.onSubmitFormAnswers}>
              {fields.map((entry, index) => {
                if ((index < qStartNum || index >= qEndNum) && includeQuestions) return null;
                return (
                  <div className="my-5" key={entry.fieldID}>
                    {(() => {
                      if (entry.fieldType === 'ReadOnlyField') {
                        // TODO: Make the readOnly fields show and be formatted properly
                        return <div />;
                      }
                      if (entry.fieldType === 'TextField') {
                        return this.getTextField(entry, formAnswers, continueClicked);
                      }
                      if (entry.fieldType === 'MultilineTextField') {
                        return this.getMultilineTextField(entry, formAnswers, continueClicked);
                      }
                      if (entry.fieldType === 'CheckBox') {
                        return this.getCheckBox(entry, formAnswers);
                      }
                      if (entry.fieldType === 'RadioButton') {
                        return this.getRadioButton(entry, formAnswers, continueClicked);
                      }
                      if (entry.fieldType === 'ComboBox') {
                        return this.getComboBox(entry, formAnswers, continueClicked);
                      }
                      if (entry.fieldType === 'ListBox') {
                        return this.getListBox(entry, formAnswers, continueClicked);
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
                      className="mr-auto btn btn-outline-primary-continue"
                      onClick={this.handlePrevious}
                    >
                       <span>&#60;</span> Previous
                    </button>
                  )}
                </div>
                <div className="col-md-4 text-center my-1">
                  <p>
                    <b>
                      Page {currentPage} of {numPages}
                    </b>
                  </p>
                </div>
                <div className="col-md-2 mr-xs-3 mr-sm-0">
                  {currentPage !== numPages ? (
                    <Button
                      type="button"
                      className="mr-auto btn btn-outline-primary-continue"
                      onClick={this.handleContinue}
                    >
                      Continue <span>&#62;</span>
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
    const { alert } = this.props;

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
