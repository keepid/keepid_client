import React, { Component } from 'react';

interface Props {
  currentPage: number,
  itemsPerPage: number,
  numElements: number,
  changeCurrentPage: any,
}

function TablePageSelector(props: Props) : any {
  const {
    currentPage,
    changeCurrentPage,
    numElements,
    itemsPerPage,
  } = props;
  const numPages : number = Math.floor((numElements - 1) / itemsPerPage) + 1;
  const numPagesArray : number[] = [];
  const numPagesCap = 2;

  for (let i = 1; i <= numPages; i++) {
    numPagesArray.push(i);
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