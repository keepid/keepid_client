import React from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

interface Props {
  cardHeight: string,
  cardWidth: string,
  cardTitle: string,
  cardText: string,
  imageSrc: any,
  imageLoc: string,
  imageSize: string,
  renderButton: boolean,
  buttonText: string,
  buttonOnClick: () => void,
  renderAdditionalContent: () => any,
}

function BaseCard(props: Props): React.ReactElement {
  const {
    cardHeight,
    cardWidth,
    cardTitle,
    cardText,
    imageSrc,
    imageLoc,
    imageSize,
    renderButton,
    buttonText,
    buttonOnClick,
    renderAdditionalContent,
  } = props;
  const cardBorderRadius = 20;
  const buttonBorderRadius = 10;
  let borderTopLeftRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomRightRadius = 0;
  if (imageLoc === 'left') {
    borderTopLeftRadius = cardBorderRadius;
    borderBottomLeftRadius = cardBorderRadius;
  } else if (imageLoc === 'right') {
    borderTopRightRadius = cardBorderRadius;
    borderBottomRightRadius = cardBorderRadius;
  }
  return (
    <div>
      <Card className="shadow border-0" style={{ height: cardHeight, width: cardWidth, borderRadius: cardBorderRadius }}>
        { imageLoc === 'left' || imageLoc === 'right'
          ? (
            <Card.Body className="p-0 d-flex flex-row">
              <Image
                className={(imageLoc === 'left') ? 'order-1' : 'order-2'}
                src={imageSrc}
                style={{
                  height: '100%',
                  width: imageSize,
                  objectFit: 'cover',
                  borderTopLeftRadius,
                  borderTopRightRadius,
                  borderBottomLeftRadius,
                  borderBottomRightRadius,
                }}
              />
              <div className={`p-4 d-flex flex-column ${(imageLoc === 'left') ? 'order-2' : 'order-1'}`}>
                <div style={{ height: '100%', overflow: 'scroll' }}>
                  <Card.Title>{cardTitle}</Card.Title>
                  <Card.Text>{cardText}</Card.Text>
                  { renderAdditionalContent() }
                </div>
                { renderButton
                  ? (
                    <button
                      className="btn btn-card mt-3"
                      type="button"
                    >
                      {buttonText}
                    </button>
                  )
                  : null }
              </div>
            </Card.Body>
          )
          : null }
        { imageLoc === 'top'
          ? (
            <Card.Body className="p-0 d-flex flex-column align-items-start" style={{ height: '100%', overflow: 'scroll' }}>
              <Image
                src={imageSrc}
                style={{
                  height: imageSize,
                  width: '100%',
                  objectFit: 'cover',
                  borderTopLeftRadius: cardBorderRadius,
                  borderTopRightRadius: cardBorderRadius,
                }}
              />
              <div className="p-4">
                <Card.Title>{cardTitle}</Card.Title>
                <Card.Text>{cardText}</Card.Text>
                { renderAdditionalContent() }
              </div>
              { renderButton
                ? (
                  <button
                    className="btn btn-card mt-auto mb-4 ml-4"
                    onClick={buttonOnClick}
                    style={{
                      borderRadius: buttonBorderRadius,
                    }}
                    type="button"
                  >
                    {buttonText}
                  </button>
                )
                : null }
            </Card.Body>
          )
          : null }
      </Card>
    </div>
  );
}

export default BaseCard;
