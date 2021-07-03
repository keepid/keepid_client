import React, { useEffect, useState } from 'react';

import getServerURL from '../../../serverOverride';

interface props{
    priceId: String,
    handleSetSelectedPriceId: any,
    handleContinue: any,
}

const PricingOption = ({ priceId, handleSetSelectedPriceId, handleContinue }: props) => {
  const [price, setPrice] = useState(0);
  const [productName, setproductName] = useState('');
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    fetchPriceObject();
  }, []);

  /*
  useEffect(() => {
    if (clicked) {
      handleSetSelectedPriceId(priceId);
    }
  }, [clicked]);
  */

  // gets the price object from stripe and then sets the price of the subscription as well as gets the productId
  const fetchPriceObject = async () => {
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
          // console.log('Price has been retrieved', priceObject);
          setPrice(priceObject.unit_amount / 100);
          fetchProductObject(priceObject.product);
        } else {
          console.log('PriceId cant be found');
        }
      });
  };

  // gets the product object from stripe and sets its name
  const fetchProductObject = async (productId) => {
    console.log('Product id is: ', productId);
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
          // console.log('Product has been retrieved', productObject);
          setproductName(productObject.name);
        } else {
          console.log('Product cant be found');
        }
      });
  };

  const handleOptionSelected = () => {
    handleSetSelectedPriceId(priceId);
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
