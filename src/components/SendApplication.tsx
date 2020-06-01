import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewer from './DocumentViewer';
import getServerURL from '../serverOverride';

import WebViewer from '@pdftron/webviewer';
import { PDFDocument } from 'pdf-lib';

interface Props {
}

interface State {
  pdfFile: File | undefined,
}

class SendApplication extends Component<Props, State> {
  viewer: any;

  constructor(props: any) {
    super(props);
    this.state = {
      pdfFile: undefined,
    };
    this.autofillPDF = this.autofillPDF.bind(this);
    this.autofillPDF();
    this.viewer = createRef();
  }

  autofillPDF() {
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
    
  }

  componentDidMount() {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/pdftron_about.pdf',
      },
        this.viewer.current,
      ).then((instance) => {
          const { docViewer } = instance;
          // you can now call WebViewer APIs here...
      });
  }

  render() {
    const {
      pdfFile,
    } = this.state;
    
    return (
      <div>
        <div className="webviewer" ref={this.viewer}></div>
        { pdfFile ? <DocumentViewer pdfFile={pdfFile} /> : <div /> }
        <form>
          <select>
            {["1", "2"].map((form) => (<option>{form}</option>))}
          </select>
        </form>
        <Link to="/my-documents">
          <button type="button" className="btn btn-outline-success">
            Back
          </button>
        </Link>
        <Link to="/developer-landing">Developer Landing</Link>
      </div>
    );
  }
}

export default SendApplication;
