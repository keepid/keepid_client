import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import './static/styles/App.scss';
import PersonSignup from './components/PersonSignup';
import OrganizationSignup from './components/OrganizationSignup';
import Header from './components/Header';
import UploadDocs from './components/UploadDocs';
import ClientLanding from './components/ClientLanding';
import Login from './components/Login';
import Print from './components/Print';
import Request from './components/Request';
import SeeDocs from './components/SeeDocs';
import Applications from './components/Applications';
import Error from './components/Error';
import Email from './components/Email';
import AdminLanding from './components/AdminLanding';
import DocViewer from './components/DocViewer';

import Role from './static/Role';

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
      role: Role.Client, // Change this to access pages
      username: 'Test',
      name: 'Test Name',
      organization: 'Test Organization',
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    this.setState({ role: Role.Client });
  }

  logOut() {
    this.setState({ role: Role.LoggedOut });
  }

  render() {
    const {
      role,
      username,
      name,
      organization,
    } = this.state;
    return (
      <div className="App">
        <Header isLoggedIn={role !== Role.LoggedOut} logIn={this.logIn} logOut={this.logOut} />
        <Router>
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
                if (role === Role.Admin || role === Role.HeadAdmin) {
                  return (<AdminLanding name={name} organization={organization} username={username} />);
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
            // Admin Components
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
            // Client Components
            <Route path="/upload-docs">
              <UploadDocs />
            </Route>
            <Route path="/see-my-docs">
              <SeeDocs />
            </Route>
            <Route path="/applications">
              <Applications />
            </Route>
            <Route path="/print">
              <Print />
            </Route>
            <Route path="/request">
              <Request />
            </Route>
            <Route path="/email">
              <Email />
            </Route>
            <Route path="/document-viewer">
              Document Viewer Here
            </Route>
            // Component
            <Route path="/error">
              <Error />
            </Route>
            <Route>
              <Redirect to="/error" />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
