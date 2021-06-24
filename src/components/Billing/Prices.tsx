import React from 'react';

import PriceOption from './PriceOption';

interface Props {
    priceId: Array<string>,
}

const Prices = () => {
  const priceIds = ['price_1IxlTyGU0udYRJ6gyphej5I6', 'price_1ImspWGU0udYRJ6ghxMmXxI9', 'price_1ImsqAGU0udYRJ6gNdM61eOB'];

  return (
    <div className="container">
      <h1>Displaying subscriptions:</h1>
      {priceIds.map((pId) => (
        <PriceOption key={pId} priceId={pId} />
      ))}
    </div>
  );
};

export default Prices;
