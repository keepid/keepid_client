import React, { useEffect, useState } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import searchIcon from '../../../static/images/search.svg';

interface Props {
  searchHeight?: string,
  searchWidth?: string,
  searchOnClick: (input: string) => void,
  searchLoading: boolean,
}

interface DefaultProps {
  searchHeight?: string,
  searchWidth?: string,
}

function SearchBar(props: Props): React.ReactElement {
  const [searchInput, setSearchInput] = useState('');
  const {
    searchHeight,
    searchWidth,
    searchOnClick,
    searchLoading,
  } = props;
  return (
    <InputGroup style={{ width: searchWidth }}>
      {/* <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /><path d="M0 0h24v24H0z" fill="none" /></svg> */}
      {/* <FormControl
        style={{ height: searchHeight }}
        placeholder="Search"
        aria-label="Search"
        aria-describedby="basic-addon1"
        onChange={(e) => setSearchInput(e.target.value)}
      /> */}
      <form className="form-inline mr-3 w-50">
                <input
                  className="form-control mr-2 w-75"
                  type="text"
                  id="search"
                  background-size="contain"
                  background-repeat="no-repeat"
                  placeholder="Search"
                  aria-label="Search"
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      console.log({ searchInput });
                    }
                  }}
                />
      </form>
      <InputGroup.Append id="basic-addon1">
        {/* <button
          className="btn border rounded-right d-flex justify-content-center"
          type="submit"
          style={{
            height: searchHeight,
          }}
          onClick={() => searchOnClick(searchInput)}
        >
          { searchLoading
            ? <div className="ld ld-ring ld-spin" />
            : <img src={searchIcon} alt="search" />}
        </button> */}
      </InputGroup.Append>
    </InputGroup>
  );
}

const defaultProps: DefaultProps = {
  searchHeight: '36px',
  searchWidth: '50',
};

SearchBar.defaultProps = defaultProps;

export default SearchBar;
