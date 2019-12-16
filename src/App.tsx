import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import './static/styles/App.scss';
import ClientSignup from './components/ClientSignup';
import WorkerSignup from './components/WorkerSignup';
import OrganizationSignup from './components/OrganizationSignup';
import Header from './components/Header';
import UploadDocs from './components/UploadDocs';
import ClientLanding from './components/ClientLanding';
import Login from './components/Login';
import Print from './components/Print';
import Request from './components/Request';
import SeeDocs from './components/SeeDocs';
import Applications from './components/Applications';
import Email from './components/Email';
import AdminLanding from './components/AdminLanding';
import DocViewer from './components/DocViewer';

interface State {
  userType: UserTypeLevel,
  username: string,
  name: string,
  organization: string
}

enum UserTypeLevel {
  HeadAdmin, // can delete admin and create admin
  Admin,
  Worker,
  Volunteer,
  Client,
  LoggedOut
}

class App extends React.Component<{}, State, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userType: UserTypeLevel.Admin, // Change this to access pages
      username: "Test",
      name: "Test Name",
      organization: "Test Organization",
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  logIn() {
    this.setState({ userType: UserTypeLevel.Client });
  }

  logOut() {
    this.setState({ userType: UserTypeLevel.LoggedOut });
  }

  render() {
    const {
      userType,
    } = this.state;
    return (
      <div className="App">
        <Header isLoggedIn={userType !== UserTypeLevel.LoggedOut} logIn={this.logIn} logOut={this.logOut} />
        <Router>
          <Switch>
            // Home/Login Components
            <Route
              exact
              path="/"
              render={() => (
                userType !== UserTypeLevel.LoggedOut
                  ? <Redirect to="/home" />
                  : <Redirect to="/login" />
              )}
            />
            <Route
              path="/home"
              render={() => {
                if (userType === UserTypeLevel.Admin || userType === UserTypeLevel.HeadAdmin) {
                  return (<AdminLanding name={this.state.name} organization={this.state.organization} username={this.state.username}  />);
                } if (userType === UserTypeLevel.Client) {
                  return (<ClientLanding />);
                }
                return (<Redirect to="/login" />);
              }}
            />
            <Route
              path="/login"
              render={() => (
                userType !== UserTypeLevel.LoggedOut
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
              path="/client-signup"
              render={() => (
                (userType === UserTypeLevel.HeadAdmin || userType === UserTypeLevel.Admin || userType === UserTypeLevel.Worker)
                  ? <ClientSignup />
                  : <Redirect to="/" />
              )}
            />

            <Route
              path="/worker-signup"
              render={() => (
                (userType === UserTypeLevel.HeadAdmin || userType === UserTypeLevel.Admin)
                  ? <WorkerSignup />
                  : <Redirect to="/" />
              )}
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
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
