import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect, useValue } from 'react-cosmos/fixture';

import BaseCard, { CardImageLoc, CardSize } from './BaseCard';

const BaseCardFixture = () => {
  const [title] = useValue('title', { defaultValue: 'The Title of the Card' });
  const [text] = useValue('text', {
    defaultValue:
      'The body text of the card. It should be kind of long so maybe something like this?',
  });
  const [cardSize] = useSelect('cardSize', {
    options: Object.values(CardSize),
  });
  const [image] = useValue('image', {
    defaultValue:
      'https://upload.wikimedia.org/wikipedia/en/5/5f/Original_Doge_meme.jpg',
  });
  const [imageLoc] = useSelect('imageLoc', {
    options: Object.values(CardImageLoc),
  });
  const [buttonText] = useValue<string>('buttonText', { defaultValue: '' });

  // @ts-ignore
  return (
    <BaseCard
      cardTitle={title}
      cardText={text}
      cardSize={cardSize}
      imageSrc={image}
      imageLoc={imageLoc}
      buttonText={buttonText || undefined}
    />
  );
};

export default BaseCardFixture;
