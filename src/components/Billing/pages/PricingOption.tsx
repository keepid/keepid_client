import { response } from 'msw/lib/types';
import React, { useEffect, useState } from 'react';

import getServerURL from '../../../serverOverride';

interface props{
    priceId: String,
    setSelectedPriceId: any,
    handleContinue: any,
}

const PricingOption = ({ priceId, setSelectedPriceId, handleContinue }: props) => {
  const [price, setPrice] = useState(0);
  const [productName, setproductName] = useState('');

  useEffect(() => {
    handleFetchPriceObject();
  }, []);

  // gets the price object from stripe and then sets the price of the subscription as well as gets the productId
  const handleFetchPriceObject = async () => {
    await fetch(`${getServerURL()}/get-price`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          const priceObject = JSON.parse(responseJSON.price);

          setPrice(priceObject.unit_amount / 100);
          handleFetchProductObject(priceObject.product);
        } else {
          // Can add a alert to display status later
          console.log('Error: ', responseJSON.status);
        }
      });
  };

  // gets the product object from stripe and sets its name
  const handleFetchProductObject = async (productId) => {
    await fetch(`${getServerURL()}/get-product`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status === 'SUCCESS') {
          const productObject = JSON.parse(responseJSON.product);

          // Set parameters we want to display from the stripe subscription object
          setproductName(productObject.name);
        } else {
          // Can add a alert to display status later
          console.log('Error: ', responseJSON.this.status);
        }
      });
  };

  const handleOptionSelected = () => {
    setSelectedPriceId(priceId);
    handleContinue();
  };

  return (
    <div className="container">
      <h5>{ productName }</h5>
      Price: $
      { price }
      <br />
      <button className="mt-2 btn btn-success loginButtonBackground w-10" type="submit" onClick={() => handleOptionSelected()}>Select</button>
    </div>
  );
};

export default PricingOption;
