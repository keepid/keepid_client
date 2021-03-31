import React from 'react';

import getServerURL from '../../../serverOverride';
import SearchBar from './SearchBar';

interface Props {
}

interface State {
  searchLoading: boolean,
}

// example use of search bar
class SearchBarTest extends React.Component<Props, State, {}> {
  constructor(props) {
    super(props);
    this.state = {
      searchLoading: false,
    };
    this.searchOnClick = this.searchOnClick.bind(this);
  }

  searchOnClick(input: string) {
    this.setState({
      searchLoading: true,
    });
    fetch(`${getServerURL()}/get-all-orgs `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        userTypes: [],
        organizations: [],
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          organizations,
        } = JSON.parse(responseJSON);
        this.setState({
          searchLoading: false,
        });
      });
  }

  render() {
    const {
      searchLoading,
    } = this.state;
    return (
      <div className="container p-5">
        <SearchBar searchOnClick={this.searchOnClick} searchLoading={searchLoading} />
      </div>
    );
  }
}

export default SearchBarTest;
