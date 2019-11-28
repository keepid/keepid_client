import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';

interface State {
  workers: any,

}

class AdminLanding extends Component<{}, State, {}> {
  tableCols = [{
    dataField: 'id',
    text: 'Worker ID',
    sort: true,
  }, {
    dataField: 'name',
    text: 'Name',
    sort: true,
  }, {
    dataField: 'role',
    text: 'Role',
    sort: true,
  }];

  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      workers: [
        {
          id: 'id1',
          name: 'exampleName1',
          role: 'worker',
        },
        {
          id: 'id2',
          name: 'exampleName2',
          role: 'worker',
        },
        {
          id: 'id3',
          name: 'exampleName3',
          role: 'worker',
        },
        {
          id: 'id4',
          name: 'exampleName4',
          role: 'admin',
        },
      ],
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
  }

  render() {
    const {
      workers
    } = this.state;
    return (
      <div>
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1 className="display-7">Your Organization</h1>
            <p className="lead">Welcome &lt;admin name here&gt;.</p>
          </div>
        </div>
        <div className="container">
          <form className="form-inline my-2 my-lg-0">
            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">Search Workers</button>
          </form>
          <div className="d-flex flex-row bd-highlight mb-3 pt-5">
            <div className="w-50 pd-3">
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={workers}
                columns={this.tableCols}
                pagination={paginationFactory()}
              />
            </div>
            <div className="card ml-5">
              <div className="card-body">
                <h5 className="card-title"> &lt;name here&gt;: Worker Permissions</h5>
                <p className="card-text">Set and Modify Permissions here</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <div className="form-group form-check">
                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                    <label className="form-check-label">Can View Client Documents</label>
                  </div>
                  <div className="form-group form-check">
                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                    <label className="form-check-label">Can Edit Client Documents</label>
                  </div>
                  <div className="form-group form-check">
                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                    <label className="form-check-label">Can Register New Clients</label>
                  </div>
                  <div className="form-group">
                    <label>Set Worker Permission Level</label>
                    <select className="form-control" id="exampleFormControlSelect1">
                      <option>Worker</option>
                      <option>Admin</option>
                      <option>Volunteer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-danger">Delete User</button>
                  </div>
                </li>
                <li className="list-group-item">
                  <button type="submit" className="btn btn-outline-primary">Save Changes</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminLanding;
