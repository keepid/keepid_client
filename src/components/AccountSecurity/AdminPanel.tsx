import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import TablePageSelector from '../TablePageSelector';
import getServerURL from '../../serverOverride';

interface Props {
  username: string,
  name: string,
  organization: string,
}

interface State {
  workers: any,
  currentWorker: any,
  currentPage: number,
  itemsPerPageSelected: any,
  numElements: number,
  searchName: string,
  username: string,
  adminName: string,
  organization: string,
}

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

class AdminPanel extends Component<Props, State> {
  tableCols = [{
    dataField: 'firstName',
    text: 'First Name',
    sort: true,
  }, {
    dataField: 'lastName',
    text: 'Last Name',
    sort: true,
  }, {
    dataField: 'privilegeLevel',
    text: 'Worker Type',
    sort: true,
  }];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentWorker: undefined,
      currentPage: 0,
      itemsPerPageSelected: listOptions[0],
      numElements: 0,
      username: props.username,
      searchName: '',
      adminName: props.name,
      organization: props.organization,
      workers: [{
        username: '',
        name: '',
        role: '',
      }],
    };
    this.onClickWorker = this.onClickWorker.bind(this);
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.getAdminWorkers = this.getAdminWorkers.bind(this);
    this.onChangeViewPermission = this.onChangeViewPermission.bind(this);
    this.onChangeEditPermission = this.onChangeEditPermission.bind(this);
    this.onChangeRegisterPermission = this.onChangeRegisterPermission.bind(this);
  }

  componentDidMount() {
    this.getAdminWorkers();
  }

  onClickWorker(event: any) {
    this.setState({ currentWorker: event });
  }

  handleChangeSearchName(event: any) {
    this.setState({
      searchName: event.target.value,
      currentPage: 0,
    }, this.getAdminWorkers);
  }

  handleChangeItemsPerPage(itemsPerPageSelected: any) {
    this.setState({
      itemsPerPageSelected,
      currentPage: 0,
    }, this.getAdminWorkers);
  }

  changeCurrentPage(newCurrentPage: number) {
    this.setState({ currentPage: newCurrentPage }, this.getAdminWorkers);
  }

  onChangeViewPermission(event: any) {
    const {
      currentWorker,
    } = this.state;
    currentWorker.viewPermission = event.target.ischecked;
    this.setState({ currentWorker });
  }

  onChangeEditPermission(event: any) {
    // const thisCopy = this;
  }

  onChangeRegisterPermission(event: any) {
    // const thisCopy = this;
  }

  getAdminWorkers() {
    const {
      searchName,
      currentPage,
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = parseInt(itemsPerPageSelected.value);
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        listType: 'members',
        currentPage,
        itemsPerPage,
        name: searchName,
      }),
    }).then((res) => res.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        const {
          people,
          numPeople,
        } = responseJSON;
        this.setState({
          numElements: numPeople,
          workers: people,
        });
      });
  }

  render() {
    const {
      currentWorker,
      currentPage,
      itemsPerPageSelected,
      numElements,
      adminName,
      organization,
      workers,
    } = this.state;
    const workerPanel = (currentWorker === undefined)
      ? (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              No Worker Selected
            </h5>
            <p className="card-text">Set and Modify Permissions here</p>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <div className="form-group form-check">
                <label htmlFor="viewCheckbox" className="form-check-label">
                  <input type="checkbox" checked={false} readOnly className="form-check-input" id="viewCheckbox" />
                  Can View Client Documents
                </label>
              </div>
              <div className="form-group form-check">
                <label htmlFor="editCheckbox" className="form-check-label">
                  <input type="checkbox" checked={false} readOnly className="form-check-input" id="editCheckbox" />
                  Can Edit Client Documents
                </label>
              </div>
              <div className="form-group form-check">
                <label htmlFor="registerCheckbox" className="form-check-label">
                  <input type="checkbox" checked={false} readOnly className="form-check-input" id="registerCheckbox" />
                  Can Register New Clients
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="permissionSelector">
                  Set Worker Permission Level
                  <select className="form-control" id="permissionSelector">
                    <option>Worker</option>
                    <option>Admin</option>
                    <option>Volunteer</option>
                  </select>
                </label>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-danger">Delete Worker Account</button>
              </div>
            </li>
            <li className="list-group-item">
              <button type="submit" className="btn btn-outline-primary">Save Changes</button>
            </li>
          </ul>
        </div>
      ) : (
        <div className="card ml-5">
          <div className="card-body">
            <h5 className="card-title">
              {currentWorker.firstName.concat(' ').concat(currentWorker.lastName).concat(': Worker Permissions')}
            </h5>
            <p className="card-text">Set and Modify Permissions here</p>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <div className="form-group form-check">
                <label htmlFor="viewCheckbox" className="form-check-label">
                  <input type="checkbox" checked={currentWorker.viewPermission} onChange={this.onChangeViewPermission} className="form-check-input" id="viewCheckbox" />
                  Can View Client Documents
                </label>
              </div>
              <div className="form-group form-check">
                <label htmlFor="editCheckbox" className="form-check-label">
                  <input type="checkbox" checked={currentWorker.editPermission} onChange={this.onChangeEditPermission} className="form-check-input" id="editCheckbox" />
                  Can Edit Client Documents
                </label>
              </div>
              <div className="form-group form-check">
                <label htmlFor="registerCheckbox" className="form-check-label">
                  <input type="checkbox" checked={currentWorker.registerPermission} onChange={this.onChangeRegisterPermission} className="form-check-input" id="registerCheckbox" />
                  Can Register New Clients
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="permissionSelector">
                  Set Worker Permission Level
                  <select className="form-control" id="permissionSelector">
                    <option>Worker</option>
                    <option>Admin</option>
                    <option>Volunteer</option>
                  </select>
                </label>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-danger">Delete Worker Account</button>
              </div>
            </li>
            <li className="list-group-item">
              <button type="submit" className="btn btn-outline-primary">Save Changes</button>
            </li>
          </ul>
        </div>
      );

    const itemsPerPage = parseInt(itemsPerPageSelected.value);
    const tablePageSelector = TablePageSelector({
      currentPage,
      itemsPerPage,
      numElements,
      changeCurrentPage: this.changeCurrentPage,
    });

    return (
      <div>
        <Helmet>
          <title>Admin Panel</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1 className="display-7">{organization}</h1>
            <p className="lead">
              {'Welcome '}
              {adminName}
              .
            </p>
          </div>
        </div>
        <div className="container">
          <form className="form-inline my-2 my-lg-0">
            <input
              className="form-control mr-sm-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              onChange={this.handleChangeSearchName}
            />
          </form>
          <div className="row pt-3">
            <div className="col-md-3 pb-3">
              <Link to="/upload-document">
                <button className="btn btn-lg btn-primary loginButtonBackground">Upload Form</button>
              </Link>
            </div>
            <div className="col-md-3 pb-3">
              <Link to="/my-documents">
                <button className="btn btn-lg btn-primary loginButtonBackground">View Applications</button>
              </Link>
            </div>
          </div>
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
          <div className="row bd-highlight mb-3 pt-5">
            <div className="col-md-8 pb-3">
              <BootstrapTable
                bootstrap4
                keyField="username"
                data={workers}
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
            <div className="col-md-4 pb-3">
              {workerPanel}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminPanel;
