import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import './static/styles/App.scss';
import { Helmet } from 'react-helmet';
import PersonSignup from './components/PersonSignup';
import OrganizationSignup from './components/OrganizationSignup';
import Header from './components/Header';
import UploadDocs from './components/UploadDocs';
import ClientLanding from './components/ClientLanding';
import Login from './components/Login';
import Request from './components/Request';
import Applications from './components/Applications';
import Error from './components/Error';
import Email from './components/Email';
import DocumentViewer from './components/DocumentViewer';
import ViewDocument from './components/ViewDocument';
import AdminPanel from './components/AdminPanel';
import MyDocuments from './components/MyDocuments';
import OurTeam from './components/OurTeam';
import Role from './static/Role';
import MyAccount from './components/MyAccount';
import Footer from './components/Footer';
import OurPartners from './components/OurPartners';
import OurMission from './components/OurMission';
import WorkerLanding from './components/WorkerLanding';
import getServerURL from './serverOverride';

interface State {
  role: Role,
  username: string,
  name: string,
  organization: string
}

class App extends React.Component<{}, State, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      role: Role.LoggedOut, // Change this to access pages
      username: 'Test',
      name: 'Test Name',
      organization: 'Test Organization',
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn(role: Role, username: string, organization: string, name: string) {
    this.setState({
      role,
      username,
      name,
      organization,
    });
  }

  logOut() {
    fetch(`${getServerURL()}/logout`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => {
      this.setState({ role: Role.LoggedOut });
    });
  }

  render() {
    const {
      role,
      username,
      name,
      organization,
    } = this.state;
    return (
      <Router>
        <div className="App">
          <Helmet>
            <title>Keep.id</title>
            <meta name="description" content="Securely Combating Homelessness" />
          </Helmet>
          <Header isLoggedIn={role !== Role.LoggedOut} logIn={this.logIn} logOut={this.logOut} role={role} />
          <Switch>
            // Home/Login Components
            <Route
              exact
              path="/"
              render={() => (
                role !== Role.LoggedOut
                  ? <Redirect to="/home" />
                  : <Redirect to="/login" />
              )}
            />
            <Route
              path="/home"
              render={() => {
                if (role === Role.Admin || role === Role.HeadAdmin || role == Role.Worker) {
                  return (<WorkerLanding name={name} organization={organization} username={username} role={role} />);
                }
                if (role === Role.Client) {
                  return (<ClientLanding />);
                }
                return (<Redirect to="/login" />);
              }}
            />
            <Route
              path="/login"
              render={() => (
                role !== Role.LoggedOut
                  ? <Redirect to="/home" />
                  : <Login />
              )}
            />
            // Signup Components
            <Route path="/organization-signup">
              <OrganizationSignup />
            </Route>
            <Route
              path="/person-signup/:roleString"
              render={(props) => {
                switch (props.match.params.roleString) {
                  case 'admin':
                    return (role === Role.HeadAdmin
                      ? <PersonSignup userRole={role} personRole={Role.Admin} />
                      : <Redirect to="/error" />
                    );
                  case 'worker':
                    return (role === Role.HeadAdmin || role === Role.Admin
                      ? <PersonSignup userRole={role} personRole={Role.Worker} />
                      : <Redirect to="/error" />
                    );
                  case 'volunteer':
                    return (role === Role.HeadAdmin || role === Role.Admin || role === Role.Worker
                      ? <PersonSignup userRole={role} personRole={Role.Volunteer} />
                      : <Redirect to="/error" />
                    );
                  case 'client':
                    return (role === Role.HeadAdmin || role === Role.Admin || role === Role.Worker || role === Role.Volunteer
                      ? <PersonSignup userRole={role} personRole={Role.Client} />
                      : <Redirect to="/error" />
                    );
                  default:
                    return <Redirect to="/error" />;
                }
              }}
            />
            // Admin Components
            <Route
              path="/admin-panel"
              render={() => {
                if (role === Role.Admin || role === Role.HeadAdmin) {
                  return (<AdminPanel name={name} organization={organization} username={username} />);
                }
                return <Redirect to="/error" />;
              }}
            />
            // Client Components
            <Route
              path="/upload-document"
              render={() => {
                if (role === Role.Client) {
                  return <UploadDocs />;
                }
                return <Redirect to="/error" />;
              }}
            />
            <Route
              path="/my-documents"
              render={() => {
                if (role === Role.Client) {
                  return <MyDocuments username={name} />;
                }
                return <Redirect to="/error" />;
              }}
            />
            <Route
              path="/applications"
              render={() => {
                if (role === Role.Client) {
                  return <Applications />;
                }
                return <Redirect to="/error" />;
              }}
            />
            <Route
              path="/request"
              render={() => {
                if (role === Role.Client) {
                  return <Request />;
                }
                return <Redirect to="/error" />;
              }}
            />
            <Route
              path="/email"
              render={() => {
                if (role === Role.Client) {
                  return <Email />;
                }
                return <Redirect to="/error" />;
              }}
            />
            // All Users
            <Route path="/our-team">
              <OurTeam />
            </Route>
            <Route path="/our-partners">
              <OurPartners />
            </Route>
            <Route path="/our-mission">
              <OurMission />
            </Route>
            <Route
              path="/settings"
              render={() => {
                if (role !== Role.LoggedOut) {
                  return <MyAccount />;
                }
                return <Redirect to="/error" />;
              }}
            />
            // Website
            // Component
            <Route path="/error">
              <Error />
            </Route>
            
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
