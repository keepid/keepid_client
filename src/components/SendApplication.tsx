import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import WebViewer from '@pdftron/webviewer';
import { PDFDocument } from 'pdf-lib';
import DocumentViewer from './DocumentViewer';
import ApplicationForm from './ApplicationForm';
import getServerURL from '../serverOverride';
import PDFType from '../static/PDFType';


interface Props {
}

interface State {
  documentData: any,
  documentId: string | undefined,
  fileName: string | undefined,
  pdfFile: File | undefined,
  formQuestions: [string, string][] | undefined,
}

class SendApplication extends Component<Props, State> {
  viewer: any;

  constructor(props: any) {
    super(props);
    this.state = {
      documentData: [],
      documentId: undefined,
      fileName: undefined,
      pdfFile: undefined,
      formQuestions: undefined,
    };
    this.onSelectDocument = this.onSelectDocument.bind(this);
    this.viewer = createRef();
  }

  componentDidMount() {
    this.getFormData();
    this.getFormQuestions();
  }

  getFormData() {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          documents,
        } = JSON.parse(responseJSON);
        this.setState({ documentData: documents });
      });
  }

  getFormQuestions() {
    this.setState({ formQuestions: [['Production Title', 'What is the name of your production?'], ['Address', 'Where is your street address?'], ['City, State, Zip', 'What is your City, State, Zip?']] });
  }

  onSelectDocument(event: any) {
    const {
      documentData,
    } = this.state;
    const index = event.target.value;
    const form = documentData[index];
    const {
      id,
      filename,
    } = form;
    fetch(`${getServerURL()}/download/`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileID: id,
        pdfType: PDFType.FORM,
      }),
    }).then(async (response) => {
      const responseBlob : Blob = await response.blob();
      const pdfFile = new File([responseBlob], filename, { type: 'application/pdf' });
      this.setState({ pdfFile });
    }).catch((error) => {
      alert('Error Fetching File');
    });
  }

  render() {
    const {
      documentData,
      pdfFile,
      formQuestions,
    } = this.state;
    const documentDataIndexes : number[] = new Array(documentData.length);
    for (let i = 0; i < documentData.length; i += 1) {
      documentDataIndexes[i] = i;
    }
    return (
      <div>
        <div className="webviewer" ref={this.viewer} />
        { formQuestions ? <ApplicationForm /> : <div />}
        <Link to="/applications">
          <button type="button" className="btn btn-outline-success">
            Back
          </button>
        </Link>
      </div>
    );
  }
}

export default SendApplication;

// autofillPDF() {
// const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
// fetch(url)
// .then(res => res.arrayBuffer())
// .then(existingPDFBytes => {
//   PDFDocument.load(existingPDFBytes)
//   .then(pdfDocument => {
//     const pages = pdfDocument.getPages()
//     const firstPage = pages[0]
//     const { width, height } = firstPage.getSize()
//     firstPage.drawText('This text was added with JavaScript!', {
//       x: 5,
//       y: height / 2 + 300,
//       size: 50,
//     });
//     pdfDocument.save()
//     .then(pdfSaved => {
//       var url = window.URL.createObjectURL( new File([pdfSaved], "pdf", {
//         type: "application/pdf",
//       }));
//       window.open(url, '_blank_');
//     });

//   });
// });

// }
