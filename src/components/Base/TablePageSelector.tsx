import React from 'react';
import uuid from 'react-uuid';

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
  for (let i = numPagesLowerBound; i <= numPagesUpperBound; i += 1) {
    numPagesArray.push(i + 1);
  }
  let pageDisplayNums : number[];
  console.log(`array${numPagesArray}`);
  if (numPages < 6) {
    pageDisplayNums = numPagesArray.slice();
  } else if (currentPage < 2 || currentPage > numPages - 3) {
    pageDisplayNums = [1, 2, -1, numPages - 1, numPages];
  } else if (currentPage < 3) {
    pageDisplayNums = [1, 2, 3, -1, numPages];
  } else if (currentPage > numPages - 4) {
    pageDisplayNums = [1, -1, ...numPagesArray.slice(-3)];
  } else {
    pageDisplayNums = [1, -1, currentPage + 1, -1, numPages];
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
      <nav aria-label="Page navigation">
        <ul className="pagination">
          {(currentPage > 0 && numPages > 5) ? <li className="page-item"><span className="page-link" onClick={handleClickPrevious}>&laquo;</span></li> : <div style={{ width: '2.2em' }} />}
          {pageDisplayNums.map((index) => {
            if (index === -1) return (<li key={uuid()} className="page-item disabled"><span className="page-link">...</span></li>);
            const isActive : string = (index === currentPage + 1) ? 'page-item active' : 'page-item';
            return (
              <li key={uuid()} className={isActive}>
                <span className="page-link" onClick={(event) => handleClickToPage(index)}>
                  {index}
                </span>
              </li>
            );
          })}
          {(currentPage < (numPages - 1) && numPages > 5) ? <li className="page-item"><span className="page-link" onClick={handleClickNext}>&raquo;</span></li> : <div style={{ width: '2.2em' }} />}
        </ul>
      </nav>
    </div>
  );
}

export default TablePageSelector;
