import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    pdfFile: File;
}

export default function DocumentViewer(props: Props): React.ReactElement {
  const { pdfFile } = props;
  return (
        <div className="tw-container tw-mx-auto tw-max-w-4xl tw-px-4">
            <Helmet>
                <title>
                    Document:
                    {pdfFile.name}
                </title>
                <meta name="description" content="Keep.id" />
            </Helmet>
            <iframe
              className="tw-w-full tw-h-[80vh] tw-border tw-border-gray-300 tw-rounded"
              src={`${window.URL.createObjectURL(pdfFile)}#view=fitH`}
              title="Document"
            />
        </div>
  );
}
