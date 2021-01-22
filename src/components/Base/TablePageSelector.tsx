import React from 'react';
import uuid from 'react-uuid';

interface Props {
  currentPage: number,
  itemsPerPage: number,
  numElements: number,
  changeCurrentPage: any,
}

enum TPage {
  EllipInd = -1,
  Pg1 = 1,
  Pg2 = 2,
  Pg3 = 3,
  ShowOn2Sides = 2,
  ShowOn1Side = 3,
  NeedEllip = 5,
}

function TablePageSelector(props: Props) : any {
  const {
    currentPage, // indexed 0
    changeCurrentPage,
    numElements,
    itemsPerPage,
  } = props;
  const numPagesDbl = numElements / itemsPerPage;
  const numPages : number = (numElements % itemsPerPage === 0) ? numPagesDbl : Math.floor(numPagesDbl) + 1;
  const numPagesArray : number[] = [];
  const numPagesLowerBound = 0;
  const numPagesUpperBound = numPagesLowerBound + numPages;
  for (let i = numPagesLowerBound; i < numPagesUpperBound; i += 1) {
    numPagesArray.push(i + 1);
  }
  let pageDisplayNums : number[];
  if (numPages < TPage.NeedEllip + 1) {
    pageDisplayNums = numPagesArray;
  } else if (currentPage < TPage.ShowOn2Sides || currentPage >= numPages - TPage.ShowOn2Sides) {
    pageDisplayNums = [TPage.Pg1, TPage.Pg2, TPage.EllipInd, numPages - 1, numPages];
  } else if (currentPage < TPage.ShowOn1Side) {
    pageDisplayNums = [TPage.Pg1, TPage.Pg2, TPage.Pg3, TPage.EllipInd, numPages];
  } else if (currentPage >= numPages - TPage.ShowOn1Side) {
    pageDisplayNums = [TPage.Pg1, TPage.EllipInd, ...numPagesArray.slice(-TPage.ShowOn1Side)];
  } else {
    pageDisplayNums = [TPage.Pg1, TPage.EllipInd, currentPage + 1, TPage.EllipInd, numPages];
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
    <div className="pt-2">
      <nav aria-label="Page navigation">
        <ul className="pagination">
          {(currentPage > 0 && numPages > TPage.NeedEllip) ? <li className="page-item"><span className="page-link" onClick={handleClickPrevious}>&laquo;</span></li> : <div style={{ width: '2.2em' }} />}
          {pageDisplayNums.map((index) => {
            if (index === TPage.EllipInd) return (<li key={uuid()} className="page-item disabled"><span className="page-link">...</span></li>);
            const isActive : string = (index === currentPage + 1) ? 'page-item active' : 'page-item';
            return (
              <li key={uuid()} className={isActive}>
                <span className="page-link" onClick={(event) => handleClickToPage(index)}>
                  {index}
                </span>
              </li>
            );
          })}
          {(currentPage < (numPages - 1) && numPages > TPage.NeedEllip) ? <li className="page-item"><span className="page-link" onClick={handleClickNext}>&raquo;</span></li> : <div style={{ width: '2.2em' }} />}
        </ul>
      </nav>
    </div>
  );
}

export default TablePageSelector;
