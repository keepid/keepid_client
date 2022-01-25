/* eslint-disable no-param-reassign */
/* eslint-disable simple-import-sort/imports */
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React, { useState, useEffect } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import getServerURL from '../../serverOverride';
import Table from '../BaseComponents/Table';
import Role from '../../static/Role';

interface Props {
  name: string;
  organization: string;
  alert: any;
  role: Role;
}

interface State {
  workers: any;
  currentWorker: any;
  searchName: string;
  adminName: string;
  organization: string;
}

const AdminPanel: React.FC<Props> = (props: Props) => {
  const [tableCols, setTableCols] = useState([
    {
      dataField: 'id',
      text: 'username',
      sort: false,
      hidden: true,
    },
    {
      dataField: 'firstName',
      text: 'First Name',
      sort: true,
    },
    {
      dataField: 'lastName',
      text: 'Last Name',
      sort: true,
    },
    {
      dataField: 'privilegeLevel',
      text: 'Worker Type',
      sort: true,
    },
  ]);
  const [currentWorker, setCurrentWorker] = useState<State['workers']>(undefined);
  const [searchName, setSearchName] = useState<State['searchName']>('');
  const [adminName, setAdminName] = useState<State['adminName']>(props.name);
  // eslint-disable-next-line react/destructuring-assignment
  const [organization, setOrganization] = useState<State['organization']>(props.organization);
  const [workers, setWorkers] = useState<State['workers']>([{}]);

  const getAdminWorkers = (search = searchName) => {
    const { role } = props;
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        role,
        listType: 'members',
        name: search,
      }),
    })
      .then((res) => res.json())
      .then((responseJSON) => {
        const { people } = responseJSON;
        if (people) {
          people.forEach((person) => {
            person.id = person.username;
            delete person.username;
          });
        }
        setWorkers(people);
      });
  };

  const handleChangeSearchName = (event: any) => {
    setSearchName(event.target.value);
    getAdminWorkers(event.target.value);
  };

  useEffect(() => {
    getAdminWorkers();
  }, []);

  const workerPanel =
      currentWorker === undefined ? (
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
                    const { alert } = props;
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
                  const { alert } = props;
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
              {currentWorker.firstName
                .concat(' ')
                .concat(currentWorker.lastName)
                .concat(': Worker Permissions')}
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
                    const { alert } = props;
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
                  const { alert } = props;
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
          <p className="lead">{`Welcome, ${adminName}`}</p>
          <div className="row">
            <div className="col-lg-7">
              <form className="form-inline my-2 my-lg-0">
                <input
                  className="form-control mr-sm-2 w-100"
                  type="search"
                  placeholder="Search by name"
                  aria-label="Search"
                  onChange={handleChangeSearchName}
                />
              </form>
            </div>
            <div className="col-lg-5">
              <div
                className="btn-toolbar float-lg-right"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group mr-2"
                  role="group"
                  aria-label="Button group"
                >
                  <Link to="/upload-document">
                    <Button type="button" variant="primary">
                      Upload Form
                    </Button>
                  </Link>
                </div>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group"
                >
                  <Link to="/my-documents">
                    <Button type="button" variant="primary">
                      View Applications
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Table
            columns={tableCols}
            data={workers}
            emptyInfo={{
              description: 'There are no members in your organization.',
            }}
          />
        </div>
      </div>
  );
};

export default withAlert()(AdminPanel);
