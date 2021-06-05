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
      <FormControl
        style={{ height: searchHeight }}
        placeholder="Search"
        aria-label="Search"
        aria-describedby="basic-addon1"
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <InputGroup.Append id="basic-addon1">
        <button
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
        </button>
      </InputGroup.Append>
    </InputGroup>
  );
}

const defaultProps: DefaultProps = {
  searchHeight: '36px',
  searchWidth: '413px',
};

SearchBar.defaultProps = defaultProps;

export default SearchBar;
