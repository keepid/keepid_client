import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Role from '../static/Role';
import SearchSVG from '../static/images/search.svg';
import getServerURL from '../serverOverride';

interface Props {
  username: string,
  name: string,
  organization: string,
  role: Role,
}

interface State {
  clients: any;
}

const options = [
  { value: 'name', label: 'Name' },
  { value: 'ssn', label: 'Social Security Number' },
  { value: 'phoneNumber', label: 'Phone Number' },
];


const listOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];


const animatedComponents = makeAnimated();

class WorkerLanding extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      clients: [{
        username: '',
        firstName: '',
        lastName: ''
      }],
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.getAdminWorkers = this.getAdminWorkers.bind(this);
  }
  getAdminWorkers() {
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        listType: 'clients',
      }),
    }).then((res) => res.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        this.setState({
          clients: responseJSON.clients,
        });
      });
  }
  render() {
    const {
      role,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron pt-4 pb-0 jumbotron-fluid bg-transparent">
          <div className="container">
            <h1 className="display-5 pb-0">My Clients</h1>
            <p className="lead">Use the search bar to help look up clients.</p>
            <div className="d-flex flex-row">
              <form className="form-inline mr-3 w-50">
                <input className="form-control mr-2 w-75" type="text" placeholder="Search" aria-label="Search" />
                <img
                  alt="Search"
                  src={SearchSVG}
                  width="22"
                  height="22"
                  className="d-inline-block align-middle ml-1"
                />
              </form>
              <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#advancedSearch" aria-expanded="false" aria-controls="collapseExample">
                Toggle Advanced Search
              </button>
            </div>
            <div className="collapse" id="advancedSearch">
              <div className="card card-body mt-3 mb-2 ml-0 pl-0 w-50 border-0">
                <h5 className="card-title">Search on multiple fields</h5>
                <Select
                  options={options}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <nav aria-label="Page navigation example">
              <ul className="pagination mt-4 mb-3 mr-5 ml-4">
                <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                <li className="page-item"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item"><a className="page-link" href="#">Next</a></li>
              </ul>
            </nav>
            <div className="w-25">
              <div className="card card-body mt-0 mb-4 border-0 p-0">
                <h5 className="card-text h6"># Items per page</h5>
                <Select
                  options={listOptions}
                  autoFocus
                  closeMenuOnSelect={false}
                  defaultValue={listOptions[0]}
                />
              </div>
            </div>
          </div>
          {/* RENDER CLIENT CARDS BELOW: MOVE THIS TO A FUNCTION LATER AND HAVE IT RENDER ALL THE INFORMATION */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-row">
                <div className="d-flex flex-column mr-4">
                  <div className="p-2 ">PROFILE PICTURE HERE</div>
                </div>
                <div className="d-flex flex-lg-column mr-4">
                  <h5 className="card-title mb-3 h4">Client First Last Name</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Email, Phone #, Address, etc.</h6>
                  <p className="card-text">Some information about the client here</p>
                  <a href="#" className="card-link">Client Profile</a>
                </div>
                <div className="d-flex flex-column mr-4">
                  <h5 className="card-title">Recent Actions</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 1" on "example date 1"</h6>
                  <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 2" on "example date 2"</h6>
                  <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 3" on "example date 3"</h6>
                </div>
                <div className="d-flex flex-column mr-4">
                  <h5 className="card-title">Actions for Client</h5>
                  <button type="button" className="btn btn-success mb-2 btn-sm">Upload Documents</button>
                  <button type="button" className="btn btn-danger mb-2 btn-sm">Delete Documents</button>
                  <button type="button" className="btn btn-info mb-2 btn-sm">Another Action</button>
                  <button type="button" className="btn btn-dark mb-2 btn-sm">Another Action</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {role === Role.Admin ? <Link to="/person-signup/worker"><button>Signup Worker</button></Link> : <div />}
        <Link to="/person-signup/client"><button>Signup Client</button></Link>
      </div>
    );
  }
}

export default WorkerLanding;
