import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DocumentViewer from './DocumentViewer';
import getServerURL from '../serverOverride';


interface Props {
  alert: any
}

interface State {
  submitStatus: boolean,
  pdfFiles: FileList | undefined,
}

function RenderPDF(props) {
  const [showResults, setShowResults] = useState(false);
  return (
    <li className="mt-3" key={props.index}>
      <div className="row">
        <button className="btn btn-outline-primary btn-sm mr-3" onClick={() => setShowResults(!showResults)}>{showResults ? "Hide" : "View"}</button>
        <p>{props.pdfFile.name}</p>
      </div>
      { showResults ? <div className="row mt-3"><DocumentViewer pdfFile={props.pdfFile}/></div> : null }
    </li>
  );
}

class UploadDocs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      submitStatus: false,
      pdfFiles: undefined,
    };
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
  }

  submitForm(event: any) {
    event.preventDefault();
    const {
      pdfFiles,
    } = this.state;
    if (pdfFiles) {
      // upload each pdf file
      for (let i = 0; i < pdfFiles.length; i++) {
        let pdfFile = pdfFiles[i]; 
        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        fetch(`${getServerURL()}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }).then((response) => response.json())
          .then((responseJSON) => {
            responseJSON = JSON.parse(responseJSON);
            const {
              status,
            } = responseJSON;
            if (status === 'success') {
              this.props.alert.show(`Successfully uploaded ${pdfFile.name}`);
              this.setState({
                submitStatus: true,
              });
            } else {
              this.props.alert.show(`Failure to upload ${pdfFile.name}`);
            }
          });
      }
    } else {
      this.props.alert.show('Please select a file');
    }
  }

  maxFilesExceeded(files, maxNumFiles) {
    return files.length > maxNumFiles;
  }

  fileNamesUnique(files) {
    let fileNames : string[] = [];
    for (let i = 0; i < files.length; i++) {
      let fileName = files[i].name;
      fileNames.push(fileName);
    }

    return fileNames.length === new Set(fileNames).size;
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const files = event.target.files;
    const maxNumFiles = 3;

    // check that the number of files uploaded doesn't exceed the maximum
    if (this.maxFilesExceeded(files, maxNumFiles)) {
      event.target.value = null // discard selected files
      this.props.alert.show(`A maximum of ${maxNumFiles} files can be uploaded at a time`);
      return;
    }

    // check that file names are unique
    if (!this.fileNamesUnique(files)) {
      event.target.value = null // discard selected files
      this.props.alert.show("File names must be unique");
      return;
    }

    // all validation met
    this.setState({ 
      pdfFiles: files,
    });
  }

  render() {
    const {
      submitStatus,
      pdfFiles,
    } = this.state;    

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

          <ul className="list-unstyled mt-5">
              {
                pdfFiles && pdfFiles.length > 0 ? Array.from(pdfFiles).map((pdfFile, index) => {
                  return <RenderPDF index={index} pdfFile={pdfFile}/>;
                }) : null
              }
          </ul>

          <div className="row justify-content-left form-group mb-5">
            <form onSubmit={this.submitForm}>
              <div className="form-row mt-3">
                <label className="btn btn-filestack btn-widget ml-5 mr-5">
                  { pdfFiles && pdfFiles.length > 0 ? "Choose New Files" : "Choose Files" }
                  <input type="file" accept="application/pdf" id="potentialPdf" multiple onChange={this.handleChangeFileUpload} hidden />
                </label>
                { pdfFiles && pdfFiles.length > 0 ? <button type="submit" className="btn btn-success">Upload</button> : null} 
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(UploadDocs);
