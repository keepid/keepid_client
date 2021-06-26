import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';

const PriceOption = (Props) => {
  const { priceId } = Props;
  const [price, setPrice] = useState(0);
  const [productName, setproductName] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [test, setTest] = useState(false);

  useEffect(() => {
    fetchPriceObject();
  }, []);

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
          console.log('Price has been retrieved', priceObject);
          setPrice(priceObject.unit_amount / 100);
          fetchProductObject(priceObject.product);
        } else {
          console.log('PriceId cant be found');
        }
      });
  };

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
          console.log('Product has been retrieved', productObject);
          setproductName(productObject.name);
        } else {
          console.log('Product cant be found');
        }
      });
  };

  if (redirect) {
    return (
      <Redirect to={{
        pathname: '/billing',
        state: { priceId },
      }}
      />
    );
  }

  if (test) {
    return (
      <Redirect to={{
        pathname: '/main',
        state: { priceId },
      }}
      />
    );
  }

  return (
    <div className="container">
      <h5>{ productName }</h5>
      <p>
        Price: $
        { price }
      </p>
      <button type="submit" onClick={() => setRedirect(true)}>
        Select
      </button>
      ---
      <button type="submit" onClick={() => setTest(true)}>
        Test button to home
      </button>
    </div>
  );
};

export default PriceOption;
