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
  clients: any,
  firstNameSearch: string,
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
      firstNameSearch: '',
      clients: [{
        username: '',
        firstName: '',
        lastName: '',
      }],
      // we should also pass in other state such as the admin information. we could also do a fetch call inside
    };
    this.handleChangeSearchFirstName = this.handleChangeSearchFirstName.bind(this);
    this.getClients = this.getClients.bind(this);
    this.renderClients = this.renderClients.bind(this);
    this.modalRender = this.modalRender.bind(this);
  }

  componentDidMount() {
    this.getClients();
  }

  handleChangeSearchFirstName(event: any) {
    this.setState({ firstNameSearch: event.target.value }, this.getClients);
  }

  getClients() {
    const {
      firstNameSearch,
    } = this.state;
    console.log(firstNameSearch);
    fetch(`${getServerURL()}/get-organization-members`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        listType: 'clients',
        firstName: firstNameSearch,
        lastName: '',
      }),
    }).then((res) => res.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        this.setState({
          clients: responseJSON.clients,
        });
      });
  }

  renderClients() {
    console.log(this.state.clients);
    const clientCards : React.ReactFragment[] = this.state.clients.map((client, i) => (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-row">
            <div className="d-flex flex-column mr-4">
              <div className="p-2 ">PROFILE PICTURE HERE</div>
            </div>
            <div className="d-flex flex-lg-column mr-4">
              <h5 className="card-title mb-3 h4">
                {client.firstName}
                {' '}
                {client.lastName}
              </h5>
              <h6 className="card-subtitle mb-2 text-muted">Email, Phone #, Address, etc.</h6>
              <p className="card-text">Some information about the client here.</p>
              <a href="#" className="card-link">Client Profile</a>
            </div>
            <div className="d-flex flex-column mr-4">
              <h5 className="card-title">Recent Actions</h5>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 1" on "example date 1"</h6>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 2" on "example date 2"</h6>
              <h6 className="card-subtitle mb-2 text-muted">Uploaded "Document 3" on "example date 3"</h6>
            </div>
            <div className="d-flex flex-column mr-4">
              <h5 className="card-title">Client Actions</h5>
              <button type="button" className="btn btn-success mb-2 btn-sm" data-toggle="modal" data-target="#authenticateModal">Upload Document</button>
              <button type="button" className="btn btn-danger mb-2 btn-sm" data-toggle="modal" data-target="#authenticateModal">View Documents</button>
              <button type="button" className="btn btn-info mb-2 btn-sm" data-toggle="modal" data-target="#authenticateModal">Send Email</button>
              <button type="button" className="btn btn-dark mb-2 btn-sm" data-toggle="modal" data-target="#authenticateModal">Submit Application</button>
            </div>
          </div>
        </div>
        {this.modalRender()}
      </div>
    ));

    return clientCards;
  }

  modalRender() {
    return (
      <div>
        <React.Fragment key="authenticateAction">
          <div className="modal fade" id="authenticateModal" role="dialog" aria-labelledby={`authenticateModal`} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Authenticate Client Account Action
                  </h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3 mt-3">
                    <div className="col card-text mt-2">
                      Client Username
                    </div>
                    <div className="col-6 card-text">
                      <input type="text" className="form-control form-purple" id={`authenticateForm`} placeholder={`Enter Username Here`} />
                    </div>
                  </div>
                  <div className="row mb-3 mt-3">
                    <div className="col card-text mt-2">
                      Client Password
                    </div>
                    <div className="col-6 card-text">
                      <input type="text" className="form-control form-purple" id="passwordVerification" placeholder="Enter Password Here" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary">Authenticate</button>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      </div>
    );
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
                <input
                  className="form-control mr-2 w-75"
                  type="text"
                  onChange={this.handleChangeSearchFirstName}
                  value={this.state.firstNameSearch}
                  placeholder="Search First Name"
                  aria-label="Search"
                />
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
          {role === Role.Admin ? <Link to="/person-signup/worker"><button type="button" className="btn btn-primary mr-4">Signup Worker</button></Link> : <div />}
          <Link to="/person-signup/client"><button type="button" className="btn btn-primary">Signup Client</button></Link>
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
          {this.renderClients()}
        </div>
      </div>
    );
  }
}

export default WorkerLanding;
