import React from 'react';

interface props{
    handlePrevious: any
}

const PaymentPage = ({ handlePrevious }: props) => (
  <div className="container">
    <h1>Payment page</h1>
    <button className="mt-2 btn btn-success loginButtonBackground w-100 ld-ext-right" type="submit" onClick={handlePrevious}>Back</button>
  </div>
);

export default PaymentPage;
