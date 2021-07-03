import React from 'react';

import PricingOption from './PricingOption';

interface props{
    handleContinue: any
    handleSetSelectedPriceId: any,
}

const PricingPage = ({ handleContinue, handleSetSelectedPriceId }: props) => {
  const priceIds = ['price_1IxlTyGU0udYRJ6gyphej5I6', 'price_1ImspWGU0udYRJ6ghxMmXxI9', 'price_1ImsqAGU0udYRJ6gNdM61eOB'];

  return (
    <div className="container">
      <h1>Displaying subscriptions:</h1>
      {priceIds.map((pId) => (
        <PricingOption
          key={pId}
          priceId={pId}
          handleSetSelectedPriceId={handleSetSelectedPriceId}
          handleContinue={handleContinue}
        />
      ))}
      <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit" onClick={handleContinue}>Continue</button>
    </div>
  );
};

export default PricingPage;
