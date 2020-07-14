import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DocumentViewer from '../DocumentViewer';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';

interface Props {
  alert: any
}

interface State {
  submitStatus: boolean,
  pdfFiles: FileList | undefined,
  buttonState: string
}

interface PDFProps {
  pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;

function RenderPDF(props: PDFProps): React.ReactElement {
  const [showResults, setShowResults] = useState(false);
  const { pdfFile } = props;
  return (
    <li className="mt-3">
      <div className="row">
        <button className="btn btn-outline-primary btn-sm mr-3" type="button" onClick={() => setShowResults(!showResults)}>{showResults ? 'Hide' : 'View'}</button>
        <p>{pdfFile.name}</p>
      </div>
      { showResults ? <div className="row mt-3"><DocumentViewer pdfFile={pdfFile} /></div> : null }
    </li>
  );
}

class DeveloperLanding extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      submitStatus: false,
      pdfFiles: undefined,
      buttonState: '',
    };
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
  }

  submitForm(event: any) {
    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const {
      pdfFiles,
    } = this.state;

    const {
      alert,
    } = this.props;

    if (pdfFiles) {
      // upload each pdf file
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles[i];
        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        formData.append('pdfType', PDFType.FORM);
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
            if (status === 'SUCCESS') {
              alert.show(`Successfully uploaded ${pdfFile.name}`);
              this.setState({
                submitStatus: true,
                buttonState: '',
                pdfFiles: undefined,
              });
            } else {
              alert.show(`Failure to upload ${pdfFile.name}`);
              this.setState({ buttonState: '' });
            }
          });
      }
    } else {
      alert.show('Please select a file');
      this.setState({ buttonState: '' });
    }
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    // check that the number of files uploaded doesn't exceed the maximum
    if (files.length > MAX_NUM_OF_FILES) {
      event.target.value = null; // discard selected files
      alert.show(`A maximum of ${MAX_NUM_OF_FILES} files can be uploaded at a time`);
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
      buttonState,
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
                pdfFiles && pdfFiles.length > 0 ? Array.from(pdfFiles).map((pdfFile, index) => <RenderPDF key={index} pdfFile={pdfFile} />) : null
              }
          </ul>

          <div className="row justify-content-left form-group mb-5">
            <form onSubmit={this.submitForm}>
              <div className="form-row mt-3">
                <label className="btn btn-filestack btn-widget ml-5 mr-5">
                  { pdfFiles && pdfFiles.length > 0 ? 'Choose New Files' : 'Choose Files' }
                  <input type="file" accept="application/pdf" id="potentialPdf" multiple onChange={this.handleChangeFileUpload} hidden />
                </label>
                { pdfFiles && pdfFiles.length > 0 ? (
                  <button type="submit" className={`btn btn-success ld-ext-right ${buttonState}`}>
                    Upload
                    <div className="ld ld-ring ld-spin" />
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(DeveloperLanding);
