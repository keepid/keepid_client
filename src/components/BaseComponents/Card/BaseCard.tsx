import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';

export enum CardImageLoc {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top'
}

export enum CardSize {
  LARGE_VERTICAL = 'large-vertical',
  LARGE_HORIZONTAL = 'large-horizontal',
  SMALL_VERTICAL = 'small-vertical',
  SMALL_HORIZONTAL = 'small-horizontal',
  MEDIUM_VERTICAL = 'medium-vertical',
  MEDIUM_HORIZONTAL = 'medium-horizontal'
}

interface Props {
  cardSize?: CardSize,
  cardHeight?: string,
  cardWidth?: string,
  cardLink?: string,
  cardTitle: string,
  cardText: string,
  imageSrc?: any,
  imageAlt?: any,
  imageLoc?: CardImageLoc,
  imageSize?: string,
  // string refers to how the image should be resized to fit its container: defaults to 'cover'; other values include: 'fill', 'contain', 'none' and 'scale-down'
  imageObjectFit?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
  children?: JSX.Element | JSX.Element[]
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
  imageObjectFit?: string,
  buttonText?: string,
  buttonOnClick?: () => void,
  renderAdditionalContent?: () => any,
  children?: JSX.Element | JSX.Element[]
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
    imageLoc?: CardImageLoc,
    imageSize?: string,
    imageObjectFit?: any,
    buttonText?: string,
    buttonOnClick?: () => void,
    renderAdditionalContent?: () => any,
    children?: JSX.Element | JSX.Element[],
  ): React.ReactElement {
    // if there is an image, adjust image corner radius size based on image location
    const cardBorderRadius = 20;
    const buttonBorderRadius = 10;
    let borderTopLeftRadius = 0;
    let borderBottomLeftRadius = 0;
    let borderTopRightRadius = 0;
    let borderBottomRightRadius = 0;
    if (imageLoc === CardImageLoc.LEFT) {
      borderTopLeftRadius = cardBorderRadius;
      borderBottomLeftRadius = cardBorderRadius;
    } else if (imageLoc === CardImageLoc.RIGHT) {
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
        { imageLoc === CardImageLoc.LEFT || imageLoc === CardImageLoc.RIGHT
          ? (
            <Card.Body className="p-0 d-flex flex-row">
              <Image
                className={(imageLoc === CardImageLoc.LEFT) ? 'order-1' : 'order-2'}
                src={imageSrc}
                alt={imageAlt}
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: imageSize,
                  overflow: 'hidden',
                  objectFit: imageObjectFit,
                  borderTopLeftRadius,
                  borderTopRightRadius,
                  borderBottomLeftRadius,
                  borderBottomRightRadius,
                }}
              />
              <div className={`p-4 d-flex flex-column ${(imageLoc === CardImageLoc.LEFT) ? 'order-2' : 'order-1'}`}>
                <div style={{ height: '100%' }}>
                  <Card.Title><h3>{cardTitle}</h3></Card.Title>
                  <Card.Text>{cardText}</Card.Text>
                  {typeof renderAdditionalContent === 'function' ? renderAdditionalContent() : null}
                </div>
                {buttonText
                  ? (
                    <Button
                      className="btn btn-card mt-3"
                      onClick={buttonOnClick}
                      style={{
                        borderRadius: buttonBorderRadius,
                      }}
                      type="button"
                    >
                      {buttonText}
                    </Button>
                  )
                  : null}
              </div>
            </Card.Body>
          )
          : null }
        { imageLoc === CardImageLoc.TOP || typeof imageLoc === 'undefined'
          ? (
            <Card.Body className="p-0 d-flex flex-column align-items-start" style={{ height: '100%' }}>
              {typeof imageLoc !== 'undefined'
                ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    style={{
                      height: imageSize,
                      width: '100%',
                      overflow: 'hidden',
                      objectFit: imageObjectFit,
                      borderTopLeftRadius: cardBorderRadius,
                      borderTopRightRadius: cardBorderRadius,
                    }}
                  />
                )
                : null}
              <div className="p-4">
                <Card.Title><h3>{cardTitle}</h3></Card.Title>
                <Card.Text>{cardText}</Card.Text>
                {typeof renderAdditionalContent === 'function' ? renderAdditionalContent() : null}
              </div>
              {buttonText
                ? (
                  <Button
                    className="btn btn-card mt-auto mb-4 ml-4"
                    onClick={buttonOnClick}
                    style={{
                      borderRadius: buttonBorderRadius,
                    }}
                    type="button"
                  >
                    {buttonText}
                  </Button>
                )
                : null}
            </Card.Body>
          )
          : null}
        {children}
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
    imageObjectFit,
    buttonText,
    buttonOnClick,
    renderAdditionalContent,
    children,
  } = props;
  let cardHeight;
  let cardWidth;
  // default card sizes
  if (cardSize === CardSize.LARGE_VERTICAL) {
    cardHeight = '535px';
    cardWidth = '385px';
  } else if (cardSize === CardSize.LARGE_HORIZONTAL) {
    cardHeight = '380px';
    cardWidth = '600px';
  } else if (cardSize === CardSize.SMALL_VERTICAL) {
    cardHeight = '435px';
    cardWidth = '265px';
  } else if (cardSize === CardSize.SMALL_HORIZONTAL) {
    cardHeight = '250px';
    cardWidth = '400px';
  } else if (cardSize === CardSize.MEDIUM_VERTICAL) {
    cardHeight = '485px';
    cardWidth = '325px';
  } else if (cardSize === CardSize.MEDIUM_HORIZONTAL) {
    cardHeight = '315px';
    cardWidth = '500px';
  } else {
    cardHeight = props.cardHeight;
    cardWidth = props.cardWidth;
  }
  return (
    <div className="ml-1 mr-1 mt-2 mb-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {cardLink !== undefined
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
                imageObjectFit,
                buttonText,
                buttonOnClick,
                renderAdditionalContent,
                children,
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
          imageObjectFit,
          buttonText,
          buttonOnClick,
          renderAdditionalContent,
          children,
        )}
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
  imageObjectFit: 'cover',
  buttonText: undefined,
  buttonOnClick: undefined,
  renderAdditionalContent: undefined,
  children: undefined,
};

BaseCard.defaultProps = defaultProps;

export default BaseCard;
