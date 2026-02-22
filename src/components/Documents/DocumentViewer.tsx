import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    pdfFile: File;
    /** When true, prevents interaction with PDF form fields */
    readOnly?: boolean;
}

export default function DocumentViewer(props: Props): React.ReactElement {
  const { pdfFile, readOnly } = props;
  return (
        <div className="tw-container tw-mx-auto tw-max-w-4xl tw-px-4">
            <Helmet>
                <title>
                    Document:
                    {pdfFile.name}
                </title>
                <meta name="description" content="Keep.id" />
            </Helmet>
            {readOnly && (
              <p className="tw-text-sm tw-text-gray-500 tw-italic tw-mb-2">
                This is a read-only preview. Any edits made here will not be saved. To make changes, go back to the form step.
              </p>
            )}
            <iframe
              className="tw-w-full tw-h-[80vh] tw-border tw-border-gray-300 tw-rounded"
              src={`${window.URL.createObjectURL(pdfFile)}#view=fitH`}
              title="Document"
            />
        </div>
  );
}
