import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';

interface Props {
  cardSize?: string,
  cardHeight?: string,
  cardWidth?: string,
  cardLink?: string,
  cardTitle: string,
  cardText: string,
  imageSrc?: any,
  imageAlt?: any,
  imageLoc?: string,
  imageSize?: string,
  objectFit?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
}

interface DefaultProps {
  cardSize?: string,
  cardHeight?: string,
  cardWidth?: string,
  cardLink?: string,
  imageSrc?: any,
  imageAlt?: any,
  imageLoc?: string,
  imageSize?: string,
  objectFit?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
}

function BaseCard(props: Props): React.ReactElement {
  const [hover, setHover] = useState(false);
  function renderCard(
    cardTitle: string,
    cardText: string,
    cardHeight?: string,
    cardWidth?: string,
    cardLink?: string,
    imageSrc?: any,
    imageAlt?: any,
    imageLoc?: string,
    imageSize?: string,
    objectFit?: any,
    buttonText?: string,
    buttonOnClick?: () => void,
    renderAdditionalContent?: () => any,
  ): React.ReactElement {
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
      <Card
        className={`border-0 ${hover && cardLink !== undefined ? 'shadow-lg' : 'shadow'}`}
        style={{
          height: cardHeight,
          width: 'auto',
          borderRadius: cardBorderRadius,
          maxWidth: cardWidth,
        }}
      >
        { imageLoc === 'left' || imageLoc === 'right'
          ? (
            <Card.Body className="p-0 d-flex flex-row">
              <Image
                className={(imageLoc === 'left') ? 'order-1' : 'order-2'}
                src={imageSrc}
                alt={imageAlt}
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: imageSize,
                  overflow: 'hidden',
                  objectFit,
                  borderTopLeftRadius,
                  borderTopRightRadius,
                  borderBottomLeftRadius,
                  borderBottomRightRadius,
                }}
              />
              <div className={`p-4 d-flex flex-column ${(imageLoc === 'left') ? 'order-2' : 'order-1'}`}>
                <div style={{ height: '100%' }}>
                  <Card.Title><h3>{cardTitle}</h3></Card.Title>
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
            <Card.Body className="p-0 d-flex flex-column align-items-start" style={{ height: '100%' }}>
              { typeof imageLoc !== 'undefined'
                ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    style={{
                      height: imageSize,
                      width: '100%',
                      overflow: 'hidden',
                      objectFit,
                      borderTopLeftRadius: cardBorderRadius,
                      borderTopRightRadius: cardBorderRadius,
                    }}
                  />
                )
                : null }
              <div className="p-4">
                <Card.Title><h3>{cardTitle}</h3></Card.Title>
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
    );
  }
  const {
    cardSize,
    cardTitle,
    cardText,
    cardLink,
    imageSrc,
    imageAlt,
    imageLoc,
    imageSize,
    objectFit,
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
  return (
    <div className="ml-1 mr-1 mt-2 mb-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      { cardLink !== undefined
        ? (
          <Link to={cardLink} className="no-link-style">
            {
              renderCard(
                cardTitle,
                cardText,
                cardHeight,
                cardWidth,
                cardLink,
                imageSrc,
                imageAlt,
                imageLoc,
                imageSize,
                objectFit,
                buttonText,
                buttonOnClick,
                renderAdditionalContent,
              )
            }
          </Link>
        )
        : renderCard(
          cardTitle,
          cardText,
          cardHeight,
          cardWidth,
          cardLink,
          imageSrc,
          imageAlt,
          imageLoc,
          imageSize,
          objectFit,
          buttonText,
          buttonOnClick,
          renderAdditionalContent,
        ) }
    </div>
  );
}

const defaultProps: DefaultProps = {
  cardSize: undefined,
  cardHeight: undefined,
  cardWidth: undefined,
  cardLink: undefined,
  imageSrc: undefined,
  imageAlt: undefined,
  imageLoc: undefined,
  imageSize: undefined,
  objectFit: 'cover',
  buttonText: undefined,
  buttonOnClick: undefined,
  renderAdditionalContent: undefined,
};

BaseCard.defaultProps = defaultProps;

export default BaseCard;
