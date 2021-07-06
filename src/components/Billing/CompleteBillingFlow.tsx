import React, { useEffect, useState } from 'react';

import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import PaymentPage from './pages/PaymentPage';
import PricingPage from './pages/PricingPage';

const CompleteBillingFlow = () => {
  const [billingStage, setBillingStage] = useState(0);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState('');

  /* Functions to handle rendering the proper page */
  const handleContinue = () => {
    setBillingStage(billingStage + 1);
  };

  const handlePrevious = () => {
    setBillingStage(billingStage - 1);
  };

  useEffect(() => {
    console.log('User selected: ', selectedPriceId);
  }, [selectedPriceId]);

  const handleBillingComponentRender = () => {
    switch (billingStage) {
      case 0: {
        return (
          <PricingPage
            handleContinue={handleContinue}
            setSelectedPriceId={setSelectedPriceId}
          />
        );
      }
      case 1: {
        return (
          <PaymentPage
            handlePrevious={handlePrevious}
            handleContinue={handleContinue}
            selectedPriceId={selectedPriceId}
            customer={customer}
            setCustomer={setCustomer}
            subscriptionData={subscriptionData}
            setSubscriptionData={setSubscriptionData}
            setSubscriptionId={setSubscriptionId}
          />
        );
      }
      case 2: {
        return (
          <PaymentConfirmationPage
            subscriptionId={subscriptionId}
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
      <h3>
        Complete billing flow:
        {' '}
        {billingStage + 1}
        /3
      </h3>
      {handleBillingComponentRender()}
    </div>
  );
};

export default CompleteBillingFlow;
