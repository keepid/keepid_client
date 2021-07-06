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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const priceObject = responseJSON;

        if (priceObject) {
          setPrice(priceObject.unit_amount / 100);
          handleFetchProductObject(priceObject.product);
        } else {
          console.log('PriceId cant be found');
        }
      });
  };

  // gets the product object from stripe and sets its name
  const handleFetchProductObject = async (productId) => {
    await fetch(`${getServerURL()}/get-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const productObject = responseJSON;

        if (productObject) {
          setproductName(productObject.name);
        } else {
          console.log('Product cant be found');
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
