import React from 'react';

import PricingOption from './PricingOption';

interface props{
    handleContinue: any
    setSelectedPriceId: any,
}

const PricingPage = ({ handleContinue, setSelectedPriceId }: props) => {
  const priceIds = ['price_1IxlTyGU0udYRJ6gyphej5I6', 'price_1ImspWGU0udYRJ6ghxMmXxI9', 'price_1ImsqAGU0udYRJ6gNdM61eOB'];

  return (
    <div className="container">
      <h1>Displaying subscriptions:</h1>
      {priceIds.map((pId) => (
        <PricingOption
          key={pId}
          priceId={pId}
          setSelectedPriceId={setSelectedPriceId}
          handleContinue={handleContinue}
        />
      ))}
    </div>
  );
};

export default PricingPage;
