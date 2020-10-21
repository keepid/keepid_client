import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import TablePageSelector from '../Base/TablePageSelector';
import getServerURL from '../../serverOverride';

interface Props {
  username: string,
  name: string,
  organization: string,
  alert: any,
}

interface State {
  workers: any,
  currentWorker: any,
  currentPage: number,
  itemsPerPageSelected: any,
  numElements: number,
  searchName: string,
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
    dataField: 'email',
    text: 'Email',
    sort: true,
  }, {
    dataField: 'privilegeLevel',
    text: 'Role',
    sort: true,
  }, {
    dataField: 'actions',
    text: 'Actions',
    sort: false,
  }];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentWorker: undefined,
      currentPage: 0,
      itemsPerPageSelected: listOptions[0],
      numElements: 0,
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
    // this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
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

  // handleChangeItemsPerPage(itemsPerPageSelected: any) {
  //   this.setState({
  //     itemsPerPageSelected,
  //     currentPage: 0,
  //   }, this.getAdminWorkers);
  // }

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

  // eslint-disable-next-line
  onChangeEditPermission(event: any) {
    // const thisCopy = this;
  }

  // eslint-disable-next-line
  onChangeRegisterPermission(event: any) {
    // const thisCopy = this;
  }

  getAdminWorkers() {
    const {
      searchName,
      currentPage,
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = Number(itemsPerPageSelected.value);
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
              <i>No Worker Selected</i>
            </h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
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
                <button type="submit" className="btn btn-outline-primary" onClick={():void => { const { alert } = this.props; alert.show('Save Changes feature coming soon...'); }}>Save Changes</button>
              </div>
            </li>
            <li className="list-group-item">
              <button type="submit" className="btn btn-danger" onClick={():void => { const { alert } = this.props; alert.show('Delete Worker Account feature coming soon...'); }}>Delete Account</button>
            </li>
          </ul>
        </div>
      ) : (
        <div className="card ml-5">
          <div className="card-body">
            <h5 className="card-title">
              {currentWorker.firstName.concat(' ').concat(currentWorker.lastName).concat(': Worker Permissions')}
            </h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
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
                <button type="submit" className="btn btn-outline-primary" onClick={():void => { const { alert } = this.props; alert.show('Save Changes feature coming soon...'); }}>Save Changes</button>
              </div>
            </li>
            <li className="list-group-item">
              <button type="submit" className="btn btn-danger" onClick={():void => { const { alert } = this.props; alert.show('Delete Worker Account feature coming soon...'); }}>Delete Worker Account</button>
            </li>
          </ul>
        </div>
      );

    const itemsPerPage = Number(itemsPerPageSelected.value);
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
        <div className="container">
          <h1 className="mt-5">{organization}</h1>
          <p>
            {' '}
            {numElements }
            {' '}
            members
            {' '}
          </p>

          <div className="row">
            <div className="col-lg">

              <form className="form-inline">
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control w-50 mb-3"
                    placeholder="Search by name, email, role..."
                    aria-label="Search"
                    onChange={this.handleChangeSearchName}
                  />
                  <div className="input-group-append mb-3">
                    <button className="btn btn-primary loginButtonBackground" type="submit">Search</button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-5">
              <div className="btn-toolbar float-lg-right" role="toolbar" aria-label="Toolbar with button groups">
                {/* <div className="btn-group mr-2" role="group" aria-label="Button group">
                  <Link to="/upload-document">
                    <button type="button" className="btn btn-primary loginButtonBackground">Upload Form</button>
                  </Link>
                </div> */}
                <div className="btn-group" role="group" aria-label="Button group">
                  <Link to="/person-signup/worker">
                    <button type="button" className="btn btn-primary loginButtonBackground">+ Invite Members</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="row ml-1 mt-3 mb-2">
            {numElements === 0 ? <div /> : tablePageSelector }
            {numElements === 0 ? <div />
              : (
                // <div className="w-25">
                //   <div className="form-inline mt-1">
                //     <Select
                //       options={listOptions}
                //       autoFocus
                //       closeMenuOnSelect={false}
                //       // onChange={this.handleChangeItemsPerPage}
                //       // value={itemsPerPageSelected}
                //     />
                //     {' '}
                //     <p className="my-auto ml-2">
                //       {' '}
                //       items per page
                //     </p>
                //   </div>
                // </div>
              )}
          </div> */}
          <div className="row bd-highlight mb-3">
            <div className="scrollbar" style={{ maxHeight: '15.625rem', overflow: 'scroll', scrollbarColor: '#7B81FF' }}>
              <div className="col pb-3">
                <BootstrapTable
                  bootstrap4
                  keyField="username"
                  data={workers}
                  hover="primary-theme"
                  striped
                  columns={this.tableCols}
                  selectRow={{
                    mode: 'radio',
                    onSelect: this.onClickWorker,
                    clickToSelect: true,
                    hideSelectColumn: true,
                    bgColor: 'primary-theme',
                  }}
                  noDataIndication="No Workers Found"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(AdminPanel);
