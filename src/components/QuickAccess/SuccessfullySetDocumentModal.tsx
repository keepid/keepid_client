import React from 'react';
import { Button, Container, Image, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

// @ts-ignore
import DocumentSetSuccessSvg from '../../static/images/QuickAccess/DocumentSetSuccess.svg';
import Messages from './QuickAccess.messages';
import { QuickAccessCategory } from './QuickAccess.util';

type Props = {
  category: QuickAccessCategory;
};
export default function SuccessfullySetDocumentModal({ category }: Props) {
  const intl = useIntl();
  const history = useHistory();

  return (
    <Modal.Dialog size="lg">
      <Modal.Header
        closeButton
        onHide={() => history.push(`/quick-access/${category}`)}
      >
        <Container>
          <Row className="justify-content-md-center mt-5">
            <h4>
              {intl.formatMessage(
                Messages['quick-access.success-modal.title'],
                {
                  categoryTitle: intl.formatMessage(
                    Messages[`quick-access.${category}.title`],
                  ),
                },
              )}
            </h4>
          </Row>
          <Row className="justify-content-md-center mt-5">
            <Image src={DocumentSetSuccessSvg} />
          </Row>
          <Row className="justify-content-md-center mt-5" onClick={() => history.push(`/quick-access/${category}`)}>
            <Button variant="primary">
              {intl.formatMessage(
                Messages['quick-access.success-modal.button'],
              )}
            </Button>
          </Row>
        </Container>
      </Modal.Header>
    </Modal.Dialog>
  );
}
