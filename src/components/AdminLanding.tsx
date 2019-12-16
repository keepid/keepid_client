import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';

interface Props {
  username: string,
  name: string,
  organization: string,
}

interface State {
  workers: any,
  currentWorker: any
  username: string,
  adminName: string,
  organization: string,
}

class AdminLanding extends Component<Props, State> {
  tableCols = [{
    dataField: 'username',
    text: 'Worker User ID',
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

  constructor(props: Props) {
    super(props);
    this.state = {
      currentWorker: {},
      username: props.username,
      adminName: props.name,
      organization: props.organization,
      workers: [{}],
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.onClickWorker = this.onClickWorker.bind(this);
    this.getAdminWorkers = this.getAdminWorkers.bind(this);
    this.onChangeViewPermission = this.onChangeViewPermission.bind(this);
    this.onChangeEditPermission = this.onChangeEditPermission.bind(this);
    this.onChangeRegisterPermission = this.onChangeRegisterPermission.bind(this);
  }

  componentDidMount() {
    this.getAdminWorkers();
  }

  onClickWorker(event: any) {
    console.log(event);
    this.setState({ currentWorker: event });
  }

  onChangeViewPermission(event: any) {
    const { currentWorker } = this.state;
    currentWorker.viewPermission = event.target.ischecked;
    this.setState({ currentWorker: this.state });
  }

  onChangeEditPermission(event: any) {
    console.log(event);
  }

  onChangeRegisterPermission(event: any) {
    console.log(event);
  }

  getAdminWorkers() {
    const workers = [{
      username: 'conchong1', name: 'Connor Chong', role: 'Admin', viewPermission: true, editPermission: true, registerPermission: true,
    }];
    this.setState({ workers });
    // fetch("http://localhost:7000/get-admin-workers", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     username: this.state.username,
    //   })
    // }).then((response) => (response.json()))
    // .then((responseJSON) => {
    //   this.setState({workers: responseJSON.workers});
    // })
  }

  render() {
    const {
      workers,
    } = this.state;
    return (
      <div>
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1 className="display-7">{this.state.organization}</h1>
            <p className="lead">
Welcome
              {this.state.adminName}
.
            </p>
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
                data={this.state.workers}
                columns={this.tableCols}
                selectRow={{ mode: 'radio', onSelect: this.onClickWorker }}
                pagination={paginationFactory()}
              />
            </div>
            <div className="card ml-5">
              <div className="card-body">
                <h5 className="card-title">
                  {' '}
                  {this.state.currentWorker.name}
: Worker Permissions
                </h5>
                <p className="card-text">Set and Modify Permissions here</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <div className="form-group form-check">
                    <label htmlFor="viewCheckbox" className="form-check-label">
                      <input type="checkbox" checked={this.state.currentWorker.viewPermission} onChange={this.onChangeViewPermission} className="form-check-input" id="viewCheckbox" />
                      Can View Client Documents
                    </label>
                  </div>
                  <div className="form-group form-check">
                    <label className="form-check-label">
                      <input type="checkbox" checked={this.state.currentWorker.editPermission} onChange={this.onChangeEditPermission} className="form-check-input" id="editCheckbox" />
                      Can Edit Client Documents
                    </label>
                  </div>
                  <div className="form-group form-check">
                    <label className="form-check-label">
                      <input type="checkbox" checked={this.state.currentWorker.registerPermission} onChange={this.onChangeRegisterPermission} className="form-check-input" id="registerCheckbox" />
                      Can Register New Clients
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      Set Worker Permission Level
                      <select className="form-control" id="exampleFormControlSelect1">
                        <option>Worker</option>
                        <option>Admin</option>
                        <option>Volunteer</option>
                      </select>
                    </label>
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
