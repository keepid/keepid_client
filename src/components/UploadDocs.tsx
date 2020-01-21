import React from 'react';

import DocViewer from './DocViewer';
import UploadLogo from '../static/images/uploading-files-to-the-cloud.svg';

interface State {
	pdfFile: File | undefined
  pdfFileSource: string | ArrayBuffer | null,
}

class UploadDocs extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      pdfFile: undefined,
      pdfFileSource: null,
    };
  }

  submitForm(event: any) {
    event.preventDefault();
    fetch('https://localhost:7000/put-documents', {
      method: 'POST',
      body: this.state.pdfFile,
    }).then((response) => response.json())
      .then((responseJSON) => {

      });
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    console.log(event.target.files);
    const file : File = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = (() => {
      console.log(reader.result);
      this.setState({ pdfFile: file });
      this.setState({ pdfFileSource: reader.result });
    });
    reader.readAsDataURL(file);
  }

  render() {
    if (this.state.pdfFile) {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <img src={UploadLogo} className="float-right mt-2" alt="Upload" />
            </div>
            <div className="col-md-6 mt-4">
              <h3 className="textPrintHeader">
                Upload A Document
              </h3>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <p className="textUploadDesc mt-3 ml-5 mr-5">
                <span>
Click the "Choose file" button to select a PDF file to upload. The name and a preview of the PDF will appear below the buttons.
                  After confirming that you have chosen the correct file, click the "Upload" button to upload. Otherwise, choose a different file.
                </span>
              </p>
            </div>
          </div>
          <div className="row justify-content-center form-group mb-5">
            <form onSubmit={this.submitForm}>
              <div className="form-row">
                <div className="col">
                  <input type="file" accept="application/pdf" id="potentialPdf" onChange={this.handleChangeFileUpload} />
                </div>
                <div className="col">
                  <button type="submit">Upload</button>
                </div>
              </div>
            </form>
          </div>
          <div className="row">
            <DocViewer pdfFile={this.state.pdfFile} />
          </div>
        </div>
      );
    }
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <img src={UploadLogo} className="float-right mt-2" alt="Upload" />
          </div>
          <div className="col-md-6 mt-4">
            <h3 className="textPrintHeader">
                  Upload A Document
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="textUploadDesc mt-3 ml-5 mr-5">
              <span>
Click the "Choose file" button to select a PDF file to upload. A preview of the document will appear below the buttons.
                  After confirming that you have chosen the correct file, click the "Upload" button to upload. Otherwise, choose a different file.
              </span>
            </p>
          </div>
        </div>
        <div className="row mb-5 justify-content-center">
          <form onSubmit={this.submitForm}>
            <input type="file" accept="application/pdf" onChange={this.handleChangeFileUpload} />
            <button type="submit">Upload</button>
          </form>
        </div>
      </div>
    );
  }
}

export default UploadDocs;
