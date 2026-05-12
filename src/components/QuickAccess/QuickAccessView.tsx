import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { Button, Image } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
// @ts-ignore
import NoDocumentSetImageSvg from '../../static/images/QuickAccess/NoDocumentSetImage.svg';
import ApplicationStylePdfViewer from '../Documents/ApplicationStylePdfViewer';
import { fetchDocuments } from './QuickAccess.api';
import Messages from './QuickAccess.messages';
import {
  findMostRecentDocumentForCategory,
  getIdCategoryForQuickAccessCategory,
  QuickAccessFile,
} from './QuickAccess.util';

type Props = {
  category: string;
};

export default function QuickAccessView({ category }: Props) {
  const intl = useIntl();
  const alert = useAlert();

  const [loading, setLoading] = useState(true);
  const [configuredDocument, setConfiguredDocument] =
    useState<QuickAccessFile | null>(null);

  useEffect(() => {
    fetchDocuments()
      .then((documents) => {
        const doc = findMostRecentDocumentForCategory(documents, category);
        setConfiguredDocument(doc);
      })
      .catch(() => {
        alert.show('Failed to fetch documents.');
      })
      .then(() => {
        setLoading(false);
      });
  }, [alert, category]);

  if (!getIdCategoryForQuickAccessCategory(category)) {
    return <Redirect to="/" />;
  }

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

  return file ? <ApplicationStylePdfViewer pdfFile={file as File} /> : null;
}

export function NoDocumentSet({ category }: Props) {
  const intl = useIntl();
  const idCategory = getIdCategoryForQuickAccessCategory(category);
  const uploadSearch = new URLSearchParams({
    mode: 'choose',
    category: idCategory || '',
    returnTo: `/quick-access/${category}`,
  }).toString();
  const uploadLink = {
    pathname: '/upload-document',
    search: `?${uploadSearch}`,
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <p className="tw-max-w-2xl tw-text-center tw-mb-4">
        {intl.formatMessage(
          Messages['quick-access.no-document-set.description'],
        )}
      </p>
      <Link to={uploadLink}>
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
