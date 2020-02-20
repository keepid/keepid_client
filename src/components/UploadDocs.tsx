import React from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DocumentViewer from './DocumentViewer';
import UploadLogo from '../static/images/uploading-files-to-the-cloud.svg';
import getServerURL from '../serverOverride';

interface State {
  submitStatus: boolean,
  pdfFile: File | undefined,
}

class UploadDocs extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      submitStatus: false,
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
    if (pdfFile) {
      const formData = new FormData();
      formData.append('file', pdfFile, pdfFile.name);
      fetch(`${getServerURL()}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then(response => response.json())
      .then(responseJSON => {
        responseJSON = JSON.parse(responseJSON);
        const {
          status,
        } = responseJSON;
        if (status === "success") {
          alert('Successfully Uploaded File');
          this.setState({
            submitStatus: true,
          });
        } else {
          alert('Failure to Upload File');
        }
        console.log(status);
      })
    } else {
      alert('Please select a file');
    }
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const file : File = event.target.files[0];
    this.setState({ pdfFile: file });
  }

  render() {
    const {
      submitStatus,
      pdfFile,
    } = this.state;
    if (submitStatus) {
      return <Redirect to="/home" />;
    }
    return (
      <div className="container">
        <Helmet>
          <title>Upload Documents</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">Upload Document</h1>
          <p className="lead pt-3">
            Click the &quot;Choose file&quot; button to select a PDF file to upload.
            The name and a preview of the PDF will appear below the buttons.
            After confirming that you have chosen the correct file, click the &quot;Upload&quot; button to upload.
            Otherwise, choose a different file.
          </p>
          {pdfFile
            ? (
              <div className="row">
                <DocumentViewer pdfFile={pdfFile} />
              </div>
            ) : <div />}
          <div className="row justify-content-left form-group mb-5">
            <form onSubmit={this.submitForm}>
              <div className="form-row mt-3">
                <div className="col">
                  <label className="btn btn-filestack btn-widget ml-5 mr-5">
                    Choose File
                    {' '}
                    <input type="file" accept="application/pdf" id="potentialPdf" onChange={this.handleChangeFileUpload} hidden />
                  </label>
                </div>
                <div className="col">
                  <button type="submit" className="btn btn-outline-success">Upload</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default UploadDocs;
