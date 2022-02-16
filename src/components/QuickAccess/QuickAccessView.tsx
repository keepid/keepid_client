import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import getServerURL from '../../serverOverride';
// @ts-ignore
import NoDocumentSetImageSvg from '../../static/images/QuickAccess/NoDocumentSetImage.svg';
import PDFType from '../../static/PDFType';
import DocumentViewer from '../Documents/DocumentViewer';
import { getConfiguredDocumentForCategory } from './QuickAccess.api';
import Messages from './QuickAccess.messages';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';

type Props = {
  category: QuickAccessCategory;
};

export default function QuickAccessView({ category }: Props) {
  const intl = useIntl();
  const alert = useAlert();

  const [loading, setLoading] = useState(true);
  const [
    configuredDocument,
    setConfiguredDocument,
  ] = useState<QuickAccessFile | null>(null);

  useEffect(() => {
    getConfiguredDocumentForCategory(category)
      .then((doc) => setConfiguredDocument(doc))
      .catch((e) => {
        console.error(e);
        alert.show('Failed to fetch configured document.');
      })
      .then(() => {
        // TODO - remove this; it's just for testing
        setConfiguredDocument({
          filename: 'birth-certificate-template.pdf',
          uploadDate: 'Sun Dec 12 23:03:07 CST 2021',
          uploader: 'Wormtongue',
          id: '61b6d40261a7002839a6cd40',
        });
        setLoading(false);
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
    <Container>
      <Link to="/">
        <span>
          <i className="fas fa-chevron-left" /> Back
        </span>
      </Link>

      <Row className="justify-content-md-center">
        <h1>
          {intl.formatMessage(Messages[`quick-access.${category}.title`])}
        </h1>
      </Row>

      {content}
    </Container>
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
    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: doc.id,
        pdfType: PDFType.IDENTIFICATION,
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
    <>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <p>
            {intl.formatMessage(
              Messages['quick-access.no-document-set.description'],
            )}
          </p>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Image src={NoDocumentSetImageSvg} />
      </Row>
      <Row className="justify-content-md-center">
        <Link to={`/quick-access/${category}/setup`}>
          <Button>
            {intl.formatMessage(
              Messages['quick-access.no-document-set.button'],
            )}
          </Button>
        </Link>
      </Row>
    </>
  );
}
