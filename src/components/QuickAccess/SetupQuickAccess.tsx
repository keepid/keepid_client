import React, { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { Button, Col, Container, Image, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Table from '../BaseComponents/Table';
import { fetchDocuments, setQuickAccessDocumentForCategory } from './QuickAccess.api';
import Messages from './QuickAccess.messages';
import { QuickAccessCategory, QuickAccessFile } from './QuickAccess.util';
import SuccessfullySetDocumentModal from './SuccessfullySetDocumentModal';

const columns = [
  {
    dataField: 'filename',
    text: 'File Name',
  },
  {
    dataField: 'uploadDate',
    text: 'Date Uploaded',
  },
  {
    dataField: 'uploader',
    text: 'Uploader',
  },
];

type Props = {
  category: QuickAccessCategory;
};
export default function SetupQuickAccess({ category }: Props) {
  const intl = useIntl();
  const alert = useAlert();

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<QuickAccessFile[]>([]);
  const [docToUse, setDocToUse] = useState<QuickAccessFile>();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDocuments()
      .then((docs) => setDocuments(docs))
      .catch((e) => {
        alert.show('Failed to fetch documents.');
      })
      .then(() => {
        setLoading(false);
      });
  }, [category]);

  function setDocument(): Promise<void> {
    return setQuickAccessDocumentForCategory(
      category,
      docToUse as QuickAccessFile,
    )
      .then(() => {
        console.log('Successfully set new document as quick access');
        setSuccess(true);
      })
      .catch((e) => {
        console.error(e);
        alert.show('Failed to set Quick Access document.');
      });
  }

  return (
    <Container>
      <Row>
        <Link to="/">
          <span>
            <i className="fas fa-chevron-left" /> Back
          </span>
        </Link>
      </Row>
      {loading ? null : (
        <div>
          <Row className="justify-content-md-center">
            <h1>{intl.formatMessage(Messages['quick-access.setup.title'])}</h1>
          </Row>
          <Row className="justify-content-md-center">
            <Col md={8}>
              <p>
                {intl.formatMessage(
                  Messages['quick-access.setup.description'],
                  {
                    categoryTitle: intl.formatMessage(
                      Messages[`quick-access.${category}.title`],
                    ),
                  },
                )}
              </p>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Table
              columns={columns}
              data={documents}
              canSelect="single"
              onSelect={(rowIds) => {
                console.log('Documents is', documents, 'with type', typeof (documents));
                console.log('Length of rowIds is ', rowIds.length);
                console.log('rowIds is', rowIds);
                if (rowIds.length === 1) {
                  const doc = documents.find((d) => d.id === rowIds[0]);
                  console.log('The doc that was found is ', doc);
                  setDocToUse(doc);
                }
              }}
              emptyInfo={{
                label: 'No Documents',
                description: 'No documents.',
              }}
            />
          </Row>
          <Row className="justify-content-md-center">
            <Button
              variant="success"
              disabled={!docToUse}
              onClick={setDocument}
            >
              Confirm
            </Button>
          </Row>
        </div>
      )}
      {success ? (
        <Modal show>
          <SuccessfullySetDocumentModal category={category} />
        </Modal>
      ) : null}
    </Container>
  );
}
