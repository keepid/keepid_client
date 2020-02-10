import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface Props {
  pdfFile: File,
}

interface State {
  currentPage: number,
  numPages: number,
}

class DocumentViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentPage: 1,
      numPages: 5,
    };
    this.onClickPrevPage = this.onClickPrevPage.bind(this);
    this.onClickNextPage = this.onClickNextPage.bind(this);
    this.onPdfLoad = this.onPdfLoad.bind(this);
  }

  onClickPrevPage(event: any) {
    const {
      currentPage,
    } = this.state;
    const newCurrentPage = currentPage - 1;
    this.setState({ currentPage: newCurrentPage });
  }

  onClickNextPage(event: any) {
    const {
      currentPage,
    } = this.state;
    const newCurrentPage = currentPage + 1;
    this.setState({ currentPage: newCurrentPage });
  }

  onPdfLoad(pdf: any) {
    const { numPages } = pdf;
    this.setState({ numPages });
  }

  render() {
    const {
      pdfFile,
    } = this.props;
    const {
      currentPage,
      numPages,
    } = this.state;
    return (
      <div className="container-fluid">
        <Helmet>
          <title>
Document:
            {pdfFile.name}
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-center">
              {pdfFile.name}
            </h2>
          </div>
        </div>
        <Document onLoadSuccess={this.onPdfLoad} file={URL.createObjectURL(pdfFile)}>
          <Page pageNumber={currentPage} />
        </Document>
        {currentPage !== 1 ? <button onClick={this.onClickPrevPage}>Prev Page</button> : <div />}
        {currentPage !== numPages ? <button onClick={this.onClickNextPage}>Next Page</button> : <div />}
      </div>
    );
  }
}

export default DocumentViewer;
