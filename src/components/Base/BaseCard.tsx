import React from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

interface Props {
  cardSize?: string,
  cardHeight?: string,
  cardWidth?: string,
  cardTitle: string,
  cardText: string,
  imageSrc?: any,
  imageLoc?: string,
  imageSize?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
}

interface DefaultProps {
  cardSize?: string,
  cardHeight?: string,
  cardWidth?: string,
  imageSrc?: any,
  imageLoc?: string,
  imageSize?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
}

function BaseCard(props: Props): React.ReactElement {
  const {
    cardSize,
    cardTitle,
    cardText,
    imageSrc,
    imageLoc,
    imageSize,
    buttonText,
    buttonOnClick,
    renderAdditionalContent,
  } = props;
  let cardHeight;
  let cardWidth;
  // default card sizes
  if (cardSize === 'large-vertical') {
    cardHeight = '535px';
    cardWidth = '385px';
  } else if (cardSize === 'large-horizontal') {
    cardHeight = '380px';
    cardWidth = '600px';
  } else if (cardSize === 'small-vertical') {
    cardHeight = '435px';
    cardWidth = '265px';
  } else if (cardSize === 'small-horizontal') {
    cardHeight = '250px';
    cardWidth = '400px';
  } else {
    cardHeight = props.cardHeight;
    cardWidth = props.cardWidth;
  }
  // if there is an image, adjust image corner radius size based on image location
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
                  { typeof renderAdditionalContent === 'function' ? renderAdditionalContent() : null }
                </div>
                { typeof buttonText !== 'undefined'
                  ? (
                    <button
                      className="btn btn-card mt-3"
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
              </div>
            </Card.Body>
          )
          : null }
        { imageLoc === 'top' || typeof imageLoc === 'undefined'
          ? (
            <Card.Body className="p-0 d-flex flex-column align-items-start" style={{ height: '100%', overflow: 'scroll' }}>
              { typeof imageLoc !== 'undefined'
                ? (
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
                )
                : null }
              <div className="p-4">
                <Card.Title>{cardTitle}</Card.Title>
                <Card.Text>{cardText}</Card.Text>
                { typeof renderAdditionalContent === 'function' ? renderAdditionalContent() : null }
              </div>
              { typeof buttonText !== 'undefined'
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

const defaultProps: DefaultProps = {
  cardSize: undefined,
  cardHeight: undefined,
  cardWidth: undefined,
  imageSrc: undefined,
  imageLoc: undefined,
  imageSize: undefined,
  buttonText: undefined,
  buttonOnClick: undefined,
  renderAdditionalContent: undefined,
};

BaseCard.defaultProps = defaultProps;

export default BaseCard;
