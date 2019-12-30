import React from 'react';

import DocViewer from './DocViewer';
import UploadLogo from '../static/images/uploading-files-to-the-cloud.svg';

interface State {
  pdfFile: File | undefined
}

class UploadDocs extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      pdfFile: undefined,
    };
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
  }

  submitForm(event: any) {
    event.preventDefault();
    const {
      pdfFile,
    } = this.state;
    fetch('https://localhost:7000/put-documents', {
      method: 'POST',
      body: pdfFile,
    }).then((response) => response.json())
      .then((responseJSON) => {

      });
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const file : File = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = (() => {
      this.setState({ pdfFile: file });
    });
    reader.readAsDataURL(file);
  }

  render() {
    const {
      pdfFile,
    } = this.state;
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
                Click the &quot;Choose file&quot; button to select a PDF file to upload. The name and a preview of the PDF will appear below the buttons.
                After confirming that you have chosen the correct file, click the &quot;Upload&quot; button to upload. Otherwise, choose a different file.
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
        {pdfFile
          ? (
            <div className="row">
              <DocViewer pdfFile={pdfFile} />
            </div>
          ) : <div />}
      </div>
    );
  }
}

export default UploadDocs;
