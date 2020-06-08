import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route, Link } from 'react-router-dom';
import SendApplication from './SendApplication';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Select from 'react-select';
import TablePageSelector from './TablePageSelector';
import getServerURL from '../serverOverride';

interface State {
  documents: any,
  currentUser: any,
  currentPage: number,
  itemsPerPageSelected: any,
  numElements: number,
  searchName: string,
  username: string,
  adminName: string,
  organization: string,
}

interface Props {
  username: string,
  name: string,
  organization: string,
}

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

const exampleDocuments = [
  { applicationName: 'Application 1', category: 'Job Application' },
  { applicationName: 'Application 2', category: 'Aid Application' },
  { applicationName: 'Application 3', category: 'Job Application' },
  { applicationName: 'Application 4', category: 'SNAP Application' },
  { applicationName: 'Application 5', category: 'Other Application' },
];

class Applications extends Component<Props, State, {}> {
  tableCols = [{
    dataField: 'applicationName',
    text: 'Application Name',
    sort: true,
  }, {
    dataField: 'category',
    text: 'Category',
    sort: true,
  }, {
    text: 'Actions',
    formatter: this.buttonFormatter,
  }];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentUser: undefined,
      currentPage: 0,
      itemsPerPageSelected: listOptions[0],
      numElements: 0,
      username: props.username,
      searchName: '',
      adminName: props.name,
      organization: props.organization,
      documents: exampleDocuments,
    };
    this.onClickWorker = this.onClickWorker.bind(this);
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.onChangeViewPermission = this.onChangeViewPermission.bind(this);
    this.buttonFormatter = this.buttonFormatter.bind(this);
  }

  onClickWorker(event: any) {
    this.setState({ currentUser: event });
  }

  handleChangeSearchName(event: any) {
    this.setState({
      searchName: event.target.value,
      currentPage: 0,
    });
  }

  handleChangeItemsPerPage(itemsPerPageSelected: any) {
    this.setState({
      itemsPerPageSelected,
      currentPage: 0,
    });
  }

  buttonFormatter(cell, row) {
    return (
      <div className="d-flex flex-column">
        <Link to="/applications/send">
          <button type="button" className="btn btn-success w-75 btn-sm p-2 m-1">Send Application</button>
        </Link>
        <Link to="/applications/send">
          <button type="button" className="btn btn-info w-75 btn-sm p-2 m-1">Check Status</button>
        </Link>
      </div>
    );
  }

  changeCurrentPage(newCurrentPage: number) {
    this.setState({ currentPage: newCurrentPage }, this.getDocuments);
  }

  onChangeViewPermission(event: any) {
    const {
      currentUser,
      username,
      adminName,
      organization,
    } = this.state;
    currentUser.viewPermission = event.target.ischecked;
    this.setState({ currentUser }, this.getDocuments);
  }

  getDocuments() {
    const {
      searchName,
      currentPage,
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = parseInt(itemsPerPageSelected.value);
    // fetch call here to get all the current Documents to fill
  }

  render() {
    const {
      currentUser,
      currentPage,
      itemsPerPageSelected,
      numElements,
      username,
      adminName,
      organization,
      documents,
    } = this.state;

    const itemsPerPage = parseInt(itemsPerPageSelected.value);
    const tablePageSelector = TablePageSelector({
      currentPage,
      itemsPerPage,
      numElements,
      changeCurrentPage: this.changeCurrentPage,
    });

    return (
      <Switch>
        <Route path="/applications/send">
          <SendApplication />
        </Route>
        <Route exact path="/applications">
          <div className="container-fluid">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4">My Applications</h1>
                <p className="lead">See all of your applications. Check the status of each of your applications here.</p>
              </div>
            </div>
            <div className="container">
              <form className="form-inline my-2 my-lg-0">
                <input
                  className="form-control mr-sm-2 w-50"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  onChange={this.handleChangeSearchName}
                />
              </form>
              <div className="row ml-1 mt-2 mb-2">
                {numElements === 0 ? <div /> : tablePageSelector }
                {numElements === 0 ? <div />
                  : (
                    <div className="w-25">
                      <div className="card card-body mt-0 mb-4 border-0 p-0">
                        <h5 className="card-text h6"># Items per page</h5>
                        <Select
                          options={listOptions}
                          autoFocus
                          closeMenuOnSelect={false}
                          onChange={this.handleChangeItemsPerPage}
                          value={itemsPerPageSelected}
                        />
                      </div>
                    </div>
                  )}
              </div>
              <div className="d-flex flex-row bd-highlight mb-3 pt-5">
                <div className="w-100 pd-3">
                  <BootstrapTable
                    bootstrap4
                    keyField="username"
                    data={documents}
                    hover
                    striped
                    columns={this.tableCols}
                    selectRow={{
                      mode: 'radio',
                      onSelect: this.onClickWorker,
                      clickToSelect: true,
                      hideSelectColumn: true,
                    }}
                    noDataIndication="No Workers Found"
                  />
                </div>
              </div>
            </div>
          </div>

        </Route>
      </Switch>
    );
  }
}

export default Applications;
