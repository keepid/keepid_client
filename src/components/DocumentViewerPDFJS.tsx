import React from 'react';

interface Props {
  pdfFile: File,
}

export default class DocumentViewer extends React.Component<Props, {}> {
  render() {
    return <a target="_blank" rel="noopener noreferrer" href={URL.createObjectURL(this.props.pdfFile)}> PDF </a>;
  }
}


// import React, { Component } from 'react';
// import { Helmet } from 'react-helmet';
// import pdfjs from 'pdfjs-dist';

// const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');

// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// // Need to validate form to make sure inputs are good, address is good, etc.
// // Google API for address checking

// interface Props {
//   pdfFile: File,
// }

// interface State {
//   pdfDocumentProxy: null | pdfjs.PDFDocumentProxy,
//   currentPage: number,
//   numPages: number,
// }

// class DocumentViewer extends Component<Props, State> {
//   canvasRef: any;

//   constructor(props: Props) {
//     super(props);
//     this.state = {
//       currentPage: 1,
//       numPages: 5,
//       pdfDocumentProxy: null,
//     };
//     this.onClickPrevPage = this.onClickPrevPage.bind(this);
//     this.onClickNextPage = this.onClickNextPage.bind(this);

//     this.canvasRef = React.createRef();
//   }

//   componentDidMount() {
//     const {
//       pdfFile,
//     } = this.props;
//     const {
//       pdfDocumentProxy,
//       currentPage,
//     } = this.state;
//     pdfjs.getDocument({ url: URL.createObjectURL(pdfFile) })
//       .promise.then((pdf) => {
//         this.setState({
//           pdfDocumentProxy: pdf,
//           numPages: pdf.numPages,
//         });
//         pdf.getPage(currentPage).then((page) => {
//           const canvas = this.canvasRef.current;
//           const context = canvas.getContext('2d');
//           const viewport = page.getViewport({ scale: 1.5 });
//           canvas.height = viewport.height;
//           canvas.width = viewport.width;
//           const renderTask = page.render({
//             canvasContext: context,
//             viewport,
//           });
//         });
//       });
//   }

//   onClickPrevPage(event: any) {
//     const {
//       currentPage,
//       pdfDocumentProxy,
//     } = this.state;
//     const newCurrentPage = currentPage - 1;
//     this.setState({ currentPage: newCurrentPage });
//     if (pdfDocumentProxy) {
//       pdfDocumentProxy.getPage(newCurrentPage).then((page) => {
//         const canvas = this.canvasRef.current;
//         const context = canvas.getContext('2d');
//         const viewport = page.getViewport({ scale: 1.5 });
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;
//         const renderTask = page.render({
//           canvasContext: context,
//           viewport,
//         });
//       });
//     }
//   }

//   onClickNextPage(event: any) {
//     const {
//       currentPage,
//       pdfDocumentProxy,
//     } = this.state;
//     const newCurrentPage = currentPage + 1;
//     this.setState({ currentPage: newCurrentPage });
//     if (pdfDocumentProxy) {
//       pdfDocumentProxy.getPage(newCurrentPage).then((page) => {
//         const canvas = this.canvasRef.current;
//         const context = canvas.getContext('2d');
//         const viewport = page.getViewport({ scale: 1.5 });
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;
//         const renderTask = page.render({
//           canvasContext: context,
//           viewport,
//         });
//       });
//     }
//   }

//   render() {
//     const {
//       pdfFile,
//     } = this.props;
//     const {
//       currentPage,
//       numPages,
//     } = this.state;
//     return (
//       <div className="container-fluid">
//         <Helmet>
//           <title>
// Document:
//             {pdfFile.name}
//           </title>
//           <meta name="description" content="Keep.id" />
//         </Helmet>
//         <div className="row">
//           <div className="col-md-12">
//             <h2 className="text-center">
//               {pdfFile.name}
//             </h2>
//           </div>
//         </div>
//         <canvas
//           ref={this.canvasRef}
//         />
//         {currentPage !== 1 ? <button onClick={this.onClickPrevPage}>Prev Page</button> : <div />}
//         {currentPage !== numPages ? <button onClick={this.onClickNextPage}>Next Page</button> : <div />}
//       </div>
//     );
//   }
// }

// export default DocumentViewer;
