import React, { Component } from 'react';

interface Props {
  currentPage: number,
  itemsPerPage: number,
  numElements: number,
  changeCurrentPage: any,
}

const numPagesConst = 3;

function TablePageSelector(props: Props) : any {
  const {
    currentPage,
    changeCurrentPage,
    numElements,
    itemsPerPage,
  } = props;
  const numPages : number = Math.floor((numElements - 1) / itemsPerPage) + 1;
  const numPagesArray : number[] = [];

  let numPagesLowerBound;
  let numPagesUpperBound;
  if (numPagesConst % 2 === 0) {
    const numPagesRange = (numPagesConst / 2) - 1;
    numPagesLowerBound = currentPage - numPagesRange;
    numPagesUpperBound = currentPage + numPagesRange + 1;
  } else {
    const numPagesRange = (numPagesConst - 1) / 2;
    numPagesLowerBound = currentPage - numPagesRange;
    numPagesUpperBound = currentPage + numPagesRange;
  }
  if (numPagesLowerBound <= 0) {
    numPagesLowerBound = 0;
    numPagesUpperBound = (numPagesConst < numPages ? numPagesConst : numPages) - 1;
  } else if (numPagesUpperBound >= numPages - 1) {
    numPagesUpperBound = numPages - 1;
    numPagesLowerBound = (numPagesConst < numPages ? numPages - numPagesConst : 0);
  }
  for (let i = numPagesLowerBound; i <= numPagesUpperBound; i+=1) {
    numPagesArray.push(i + 1);
  }

  function handleClickToPage(index: number) {
    changeCurrentPage(index - 1);
  }

  function handleClickPrevious(event: any) {
    const newCurrentPage = currentPage - 1;
    changeCurrentPage(newCurrentPage);
  }

  function handleClickNext(event: any) {
    const newCurrentPage = currentPage + 1;
    changeCurrentPage(newCurrentPage);
  }

  return (
    <div>
      <nav aria-label="Page navigation example">
        <ul className="pagination mt-4 mb-3 mr-5 ml-4">
          {currentPage > 0 ? <li className="page-item"><span className="page-link" onClick={handleClickPrevious}>Previous</span></li> : <div />}
          {numPagesArray.map((index) => <li className="page-item"><span className="page-link" onClick={(event) => handleClickToPage(index)}>{index}</span></li>)}
          {currentPage < (numPages - 1) ? <li className="page-item"><span className="page-link" onClick={handleClickNext}>Next</span></li> : <div />}
        </ul>
      </nav>
    </div>
  );
}

export default TablePageSelector;
