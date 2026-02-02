import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { Button, Image } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
// @ts-ignore
import NoDocumentSetImageSvg from '../../static/images/QuickAccess/NoDocumentSetImage.svg';
import DocumentViewer from '../Documents/DocumentViewer';
import { fetchDocuments } from './QuickAccess.api';
import Messages from './QuickAccess.messages';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';

type Props = {
  category: QuickAccessCategory;
};

export default function QuickAccessView({ category }: Props) {
  const intl = useIntl();
  const alert = useAlert();

  const [loading, setLoading] = useState(true);
  const [configuredDocument, setConfiguredDocument] =
    useState<QuickAccessFile | null>(null);

  useEffect(() => {
    let idToMatch = null;

    fetch(`${getServerURL()}/get-default-id`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        documentType: category,
      }),
    })
      .then((response) => response.json())
      .then((x) => {
        // console.log(
        //   'Response from server is ',
        //   x,
        //   ' for getQuickAccessId of category',
        //   category,
        // );
        idToMatch = x.fileId;
        // console.log('The idToMatch is', idToMatch);

        fetchDocuments()
          .then((documents) => {
            // console.log(
            //   'fetchDocuments in QuickAccessView returned ',
            //   documents,
            // );
            const doc = documents.find((d) => d.id === idToMatch);

            // console.log('The document that matches is ', doc);

            if (doc != null) {
              setConfiguredDocument({
                filename: doc.filename,
                uploadDate: doc.uploadDate,
                uploader: doc.uploader,
                id: doc.id,
              });
            }
          })
          .catch((e) => {
            alert.show('Failed to fetch documents.');
          })
          .then(() => {
            setLoading(false);
          });
      });
  }, [category]);

  let content;

  if (loading) {
    content = null;
  } else if (configuredDocument) {
    content = <QuickAccessDocumentViewer doc={configuredDocument} />;
  } else {
    content = <NoDocumentSet category={category} />;
  }

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-pb-8">
      <Link to="/">
        <button type="button" className="btn btn-primary my-3 mr-2">
          <i className="fas fa-chevron-left" /> Back
        </button>
      </Link>

      <h1 className="tw-text-center tw-mb-4">
        {intl.formatMessage(Messages[`quick-access.${category}.title`])}
      </h1>

      {content}
    </div>
  );
}

type QuickAccessDocumentViewerProps = {
  doc: QuickAccessFile;
};
export function QuickAccessDocumentViewer({
  doc,
}: QuickAccessDocumentViewerProps) {
  const [file, setFile] = useState<File>();

  useEffect(() => {
    fetch(`${getServerURL()}/download-file`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: doc.id,
        fileType: FileType.IDENTIFICATION_PDF,
      }),
    })
      .then((response) => response.blob())
      .then((blob) =>
        setFile(new File([blob], doc.filename, { type: 'application/pdf' })));
  }, [doc]);

  return file ? <DocumentViewer pdfFile={file as File} /> : null;
}

export function NoDocumentSet({ category }: Props) {
  const intl = useIntl();
  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <p className="tw-max-w-2xl tw-text-center tw-mb-4">
        {intl.formatMessage(
          Messages['quick-access.no-document-set.description'],
        )}
      </p>
      <Link to={`/quick-access/${category}/setup`}>
        <Button>
          {intl.formatMessage(
            Messages['quick-access.no-document-set.button'],
          )}
        </Button>
      </Link>
      <Image src={NoDocumentSetImageSvg} className="tw-mt-4" />
    </div>
  );
}
