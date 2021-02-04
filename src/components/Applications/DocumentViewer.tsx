import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
  pdfFile: File,
}

export default function DocumentViewer(props: Props): React.ReactElement {
  const {
    pdfFile,
  } = props;
  return (
    <div className="container">
      <Helmet>
        <title>
          Document:
          {' '}
          {pdfFile.name}
        </title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="row embed-responsive embed-responsive-16by9 align-content-center">
        <iframe className="embed-responsive-item" src={window.URL.createObjectURL(pdfFile)} title="Document" />
      </div>
    </div>
  );
}
