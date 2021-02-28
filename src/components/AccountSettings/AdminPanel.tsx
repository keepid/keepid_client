/* eslint-disable no-param-reassign */
/* eslint-disable simple-import-sort/imports */
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import getServerURL from '../../serverOverride';
import Table from '../BaseComponents/Table';
import Role from '../../static/Role';

interface Props {
  username: string,
  name: string,
  organization: string,
  alert: any,
  role: Role,
}

interface State {
  workers: any,
  currentWorker: any,
  searchName: string,
  adminName: string,
  organization: string,
}

class AdminPanel extends Component<Props, State> {
  tableCols = [{
    dataField: 'id',
    text: 'username',
    sort: false,
    hidden: true,
  }, {
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
      searchName: '',
      adminName: props.name,
      organization: props.organization,
      workers: [{}],
    };
    this.onClickWorker = this.onClickWorker.bind(this);
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
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
    }, this.getAdminWorkers);
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
    const { searchName } = this.state;
    const { role } = this.props;
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role,
        listType: 'members',
        name: searchName,
      }),
    }).then((res) => res.json())
      .then((responseJSON) => {
        const { people } = responseJSON;
        if (people) {
          people.forEach((person) => {
            person.id = person.username;
            delete person.username;
          });
        }
        this.setState({ workers: people });
      });
  }

  render() {
    const {
      currentWorker,
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
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  onClick={(): void => {
                    const { alert } = this.props;
                    alert.show('Save Changes feature coming soon...');
                  }}
                >
                  Save Changes
                </button>
              </div>
            </li>
            <li className="list-group-item">
              <button
                type="submit"
                className="btn btn-danger"
                onClick={(): void => {
                  const { alert } = this.props;
                  alert.show('Delete Worker Account feature coming soon...');
                }}
              >
                Delete Account
              </button>
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
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  onClick={(): void => {
                    const { alert } = this.props;
                    alert.show('Save Changes feature coming soon...');
                  }}
                >
                  Save Changes
                </button>
              </div>
            </li>
            <li className="list-group-item">
              <button
                type="submit"
                className="btn btn-danger"
                onClick={(): void => {
                  const { alert } = this.props;
                  alert.show('Delete Worker Account feature coming soon...');
                }}
              >
                Delete Worker Account
              </button>
            </li>
          </ul>
        </div>
      );
    return (
      <div>
        <Helmet>
          <title>Admin Panel</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container">
          <h1 className="mt-5">{organization}</h1>
          <p className="lead">
            {'Welcome, '}
            {adminName}
            !
          </p>
          <div className="row">
            <div className="col-lg-7">
              <form className="form-inline my-2 my-lg-0">
                <input
                  className="form-control mr-sm-2 w-100"
                  type="search"
                  placeholder="Search by name"
                  aria-label="Search"
                  onChange={this.handleChangeSearchName}
                />
              </form>
            </div>
            <div className="col-lg-5">
              <div className="btn-toolbar float-lg-right" role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group mr-2" role="group" aria-label="Button group">
                  <Link to="/upload-document">
                    <button type="button" className="btn btn-primary loginButtonBackground">Upload Form</button>
                  </Link>
                </div>
                <div className="btn-group" role="group" aria-label="Button group">
                  <Link to="/my-documents">
                    <button type="button" className="btn btn-primary loginButtonBackground">View Applications</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Table
            columns={this.tableCols}
            data={workers}
            emptyInfo={{ description: 'There are no members in your organization.' }}
          />
        </div>
      </div>
    );
  }
}

export default withAlert()(AdminPanel);
