import React from 'react';
import BaseCard from './BaseCard';
import testImage from '../../static/images/building.svg';

interface Props {
}

function TestCardPage(props: Props): React.ReactElement {
  const cardTitle = 'Card Title';
  const cardText = 'Card text goes here...';
  const buttonText = 'Test button';
  const buttonOnClick = () => { console.log('button click'); };
  const renderAdditionalContent = () => (<p>Some additional content</p>);
  const renderALotOfAdditionalContent = () => (<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vulputate sed magna vitae pharetra. Nullam ultricies tortor eget ante fermentum, vel facilisis purus lacinia. Nunc malesuada egestas cursus. Mauris enim quam, facilisis non ligula sit amet, ultrices euismod justo. Phasellus efficitur, ligula ut consectetur condimentum, diam dolor aliquet mauris, a rutrum ante velit in turpis. Curabitur ut imperdiet magna. Donec metus mauris, maximus vel urna vel, ultricies consequat arcu. Integer vestibulum urna id eros pulvinar consequat. Cras euismod quam accumsan justo blandit, vel pulvinar erat convallis. Etiam commodo accumsan purus convallis posuere. Duis accumsan et magna ac aliquam.</p>);
  return (
    <div className="p-5">
      <h5>A large vertical card with image on the top</h5>
      <BaseCard cardSize="large-vertical" imageSrc={testImage} imageLoc="top" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} />
      <div className="p-5" />
      <h5>A large horizontal card with image on the left</h5>
      <BaseCard cardSize="large-horizontal" imageSrc={testImage} imageLoc="left" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the right</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="right" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the right and no button</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="right" imageSize="50%" cardTitle={cardTitle} cardText={cardText} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the right and additional content</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="right" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} renderAdditionalContent={renderAdditionalContent} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the left and additional content</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="left" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} renderAdditionalContent={renderAdditionalContent} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the top and additional content (need to scroll)</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="top" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} renderAdditionalContent={renderAdditionalContent} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the right and additional content (need to scroll)</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="right" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} renderAdditionalContent={renderALotOfAdditionalContent} />
      <div className="p-5" />
      <h5>A small horizontal card with image on the left and additional content (need to scroll)</h5>
      <BaseCard cardSize="small-horizontal" imageSrc={testImage} imageLoc="left" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} renderAdditionalContent={renderALotOfAdditionalContent} />
      <div className="p-5" />
      <h5>A small horizontal card with image and custom size</h5>
      <BaseCard cardHeight="400px" cardWidth="400px" imageSrc={testImage} imageLoc="left" imageSize="50%" cardTitle={cardTitle} cardText={cardText} buttonText={buttonText} buttonOnClick={buttonOnClick} />
      <div className="p-5" />
      <h5>A small horizontal card without image, without button, with custom size</h5>
      <BaseCard cardHeight="400px" cardWidth="400px" cardTitle={cardTitle} cardText={cardText} />
      <div className="p-5" />
    </div>
  );
}

export default TestCardPage;
