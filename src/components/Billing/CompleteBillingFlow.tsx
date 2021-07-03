import React, { useState } from 'react';

import PaymentPage from './pages/PaymentPage';
import PricingPage from './pages/PricingPage';

const CompleteBillingFlow = () => {
  const [billingStage, setBillingStage] = useState(0);

  const [selectedPriceId, setSelectedPriceId] = useState('');

  /* Functions to handle rendering the proper page */
  const handleContinue = () => {
    console.log('Next has been pressed');
    setBillingStage(billingStage + 1);
  };

  const handlePrevious = () => {
    console.log('Previous has been pressed');
    setBillingStage(billingStage - 1);
  };

  /* Functions to handle  */
  const handleSetSelectedPriceId = (priceId) => {
    console.log('PriceId has been updated: ', priceId);
    setSelectedPriceId(priceId);
  };

  const handleBillingComponentRender = () => {
    switch (billingStage) {
      case 0: {
        return (
          <PricingPage
            handleContinue={handleContinue}
            handleSetSelectedPriceId={handleSetSelectedPriceId}
          />
        );
      }
      case 1: {
        return (
          <PaymentPage
            handlePrevious={handlePrevious}
          />
        );
      }
      default: {
        return (
          <div> Error on billing flow </div>
        );
      }
    }
  };

  return (
    <div className="container">
      <h3>Complete billing flow</h3>
      {handleBillingComponentRender()}
    </div>
  );
};

export default CompleteBillingFlow;
