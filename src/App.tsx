import './static/styles/App.scss';
import './static/styles/Table.scss';
import './static/styles/BaseCard.scss';

import React, { createContext } from 'react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import Careers from './components/AboutUs/Careers';
import EULA from './components/AboutUs/EULA';
import OurPartners from './components/AboutUs/OurPartners';
import OurTeam from './components/AboutUs/OurTeam';
import PrivacyPolicy from './components/AboutUs/PrivacyPolicy';
import AdminPanel from './components/AccountSettings/AdminPanel';
import ClientProfilePage from './components/AccountSettings/ClientProfilePage';
import MyAccount from './components/AccountSettings/MyAccount';
import MyOrganization from './components/AccountSettings/MyOrganization';
import Applications from './components/Applications/Applications';
import SelectApplication from './components/Applications/SelectApplication';
import MyDocuments from './components/Documents/MyDocuments';
import UploadDocs from './components/Documents/UploadDocs';
import Error from './components/Error';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home/index';
import IssueReport from './components/IssueReport';
import AdminDashboard from './components/LandingPages/AdminDashboard';
import ClientLanding from './components/LandingPages/ClientLanding';
import DevPanel from './components/LandingPages/DeveloperLanding';
import WorkerLanding from './components/LandingPages/WorkerLanding';
import MyInformation from './components/MyInformation/MyInformation';
import FindOrganization from './components/OrgFinder/FindOrganization';
import QuickAccessRouter from './components/QuickAccess/QuickAccess.router';
import SignUpRouter, {
  paths as SignUpRouterPaths,
} from './components/SignUp/SignUp.router';
import AutoLogout from './components/UserAuthentication/AutoLogout';
import ForgotPassword from './components/UserAuthentication/ForgotPassword';
import LoginPage from './components/UserAuthentication/LoginPage';
import ResetPassword from './components/UserAuthentication/ResetPassword';
import getServerURL from './serverOverride';
import Role from './static/Role';

window.onload = () => {
  ReactGA.initialize('AW-391118279');
  ReactGA.pageview(window.location.pathname + window.location.search);
};

interface State {
  role: Role;
  username: string;
  name: string;
  organization: string;
  autoLogout: boolean;
}

interface ContextInterface {
  username: string;
  organization: string;
}
export const UserContext = React.createContext<ContextInterface>({
  username: '',
  organization: '',
});

class App extends React.Component<{}, State, {}> {
  constructor(props: {}) {
    super(props);

    // set the original state based on session storage
    const jsonData = sessionStorage.getItem('mySessionStorageData');
    const jsonLogout = sessionStorage.getItem('autoLogout');
    if (jsonData && jsonLogout) {
      const data = JSON.parse(jsonData);
      const logout = JSON.parse(jsonLogout);
      this.state = {
        role: data.role,
        username: data.username,
        name: data.name,
        organization: data.organization,
        autoLogout: logout,
      };
    } else {
      this.state = {
        role: Role.LoggedOut,
        username: '',
        name: '',
        organization: '',
        autoLogout: false,
      };
    }
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.setAutoLogout = this.setAutoLogout.bind(this);
  }

  // this function is needed to tell the home page that the user was logged out automatically
  // or remove that notification
  setAutoLogout(logout: boolean) {
    this.setState({
      autoLogout: logout,
    });
    const obj = { autoLogout: this.state.autoLogout };
    sessionStorage.setItem('autoLogout', JSON.stringify(obj));
  }

  logIn(role: Role, username: string, organization: string, name: string) {
    this.setState({
      role,
      username,
      name,
      organization,
    });
    const obj = { role, username, name, organization };
    sessionStorage.setItem('mySessionStorageData', JSON.stringify(obj));
  }

  logOut() {
    this.setState({
      username: '',
      name: '',
      organization: '',
      role: Role.LoggedOut,
    });

    fetch(`${getServerURL()}/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    sessionStorage.clear();
  }

  componentDidMount() {
    fetch(`${getServerURL()}/authenticate`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          userRole,
          organization,
          username,
          firstName,
          lastName,
        } = responseJSON;
        if (status === 'AUTH_SUCCESS') {
          const role = () => {
            switch (userRole) {
              case 'Director':
                return Role.Director;
              case 'Admin':
                return Role.Admin;
              case 'Worker':
                return Role.Worker;
              case 'Client':
                return Role.Client;
              case 'Developer':
                return Role.Developer;
              default:
                return Role.LoggedOut;
            }
          };
          // if the session storage does not match the authentication, logout
          const jsonData = sessionStorage.getItem('mySessionStorageData');
          if (jsonData) {
            const data = JSON.parse(jsonData);
            if (
              !(
                role() === data.role &&
                username === data.username &&
                organization === data.organization
              ) &&
              data.name === `${firstName} ${lastName}`
            ) {
              this.logOut();
            }
          } else {
            this.logOut();
          }
        } else {
          this.logOut();
        }
      })
      .catch((e) => {
        console.log('Server is not running: ', e);
      });
  }

  render() {
    const { role, username, name, organization, autoLogout } = this.state;
    return (
      <Router>
        <UserContext.Provider value={{ username: this.state.username, organization: this.state.organization }}>
        <div className="App">
          <div className="app">
            <Helmet>
              <title>Keep.id</title>
              <meta
                name="description"
                content="Securely Combating Homelessness"
              />
            </Helmet>
            <Header
              isLoggedIn={role !== Role.LoggedOut}
              logIn={this.logIn}
              logOut={this.logOut}
              role={role}
            />
            {role !== Role.LoggedOut ? (
              <AutoLogout
                logOut={this.logOut}
                setAutoLogout={this.setAutoLogout}
              />
            ) : null}
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/home" />} />
              <Route path="/our-team">
                <OurTeam />
              </Route>
              <Route path="/our-partners">
                <OurPartners />
              </Route>
              <Route path="/privacy-policy">
                <PrivacyPolicy />
              </Route>
              <Route
                path="/eula"
                render={() => {
                  if (role !== Role.LoggedOut) {
                    return <EULA />;
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/eula"
                render={() => {
                  if (role === Role.Admin || role === Role.Director) {
                    return <AdminDashboard />;
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/my-information"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker ||
                    role === Role.Client
                  ) {
                    return <MyInformation username={username} />;
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route path="/careers">
                <Careers />
              </Route>
              <Route path="/issue-report">
                <IssueReport
                  designatedHeader="Report an Issue"
                  designatedSubHeader="Thank you for helping us identify issues with our platform."
                />
              </Route>
              <Route path="/leave-feedback">
                <IssueReport
                  designatedHeader="Leave Feedback"
                  designatedSubHeader="Thank you for helping us with your personalized feedback about our platform."
                />
              </Route>
              <Route path="/forgot-password">
                <ForgotPassword />
              </Route>
              <Route path="/reset-password/:jwt">
                <ResetPassword />
              </Route>
              <Route
                path="/home"
                render={() => {
                  if (
                    role === Role.Director ||
                    role === Role.Admin ||
                    role === Role.Worker
                  ) {
                    return (
                      <WorkerLanding
                        name={name}
                        organization={organization}
                        username={username}
                        role={role}
                      />
                    );
                  }
                  if (role === Role.Client) {
                    return <ClientLanding name={name} username={username} />;
                  }
                  if (role === Role.Developer) {
                    return (
                      <DevPanel
                        name={name}
                        organization={organization}
                        username={username}
                        role={role}
                      />
                    );
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/find-organizations"
                render={() => <FindOrganization />}
              />
              <Route
                path="/login"
                render={() =>
                  role !== Role.LoggedOut ? (
                    <Redirect to="/home" />
                  ) : (
                    <LoginPage
                      isLoggedIn={role !== Role.LoggedOut}
                      logIn={this.logIn}
                      logOut={this.logOut}
                      role={role}
                      autoLogout={autoLogout}
                      setAutoLogout={this.setAutoLogout}
                    />
                  )
                }
              />

              <Route
                path="/admin-panel"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (
                      <AdminPanel
                        name={name}
                        organization={organization}
                        username={username}
                        role={role}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/dev-panel"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (
                      <DevPanel
                        userRole={role}
                        name={name}
                        organization={organization}
                        username={username}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/upload-document/:clientUsername"
                render={(props) => {
                  const { clientUsername } = props.match.params;
                  if (
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker ||
                    role === Role.Client
                  ) {
                    return (
                      <UploadDocs
                        userRole={Role.Client}
                        username={clientUsername}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/upload-document"
                render={() => {
                  if (
                    role === Role.Client ||
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return <UploadDocs userRole={role} username={username} />;
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/my-documents/:clientUsername"
                render={(props) => {
                  const { clientUsername } = props.match.params;
                  if (
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer ||
                    role === Role.Client
                  ) {
                    return (
                      <MyDocuments
                        userRole={Role.Client}
                        username={clientUsername}
                      />
                    );
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/my-documents"
                render={() => {
                  if (
                    role === Role.Client ||
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return <MyDocuments userRole={role} username={username} />;
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/applications/createnew"
                render={() => {
                  if (
                    role === Role.Client ||
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return (
                      <SelectApplication />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/applications"
                render={({ location }) => {
                  if (
                    role === Role.Client ||
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return (
                      <Applications
                        name={name}
                        organization={organization}
                        username={username}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route path="/quick-access">
                <QuickAccessRouter />
              </Route>
              <Route
                path="/settings"
                render={() => {
                  if (role !== Role.LoggedOut) {
                    return <MyAccount />;
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/my-organization"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (
                      <MyOrganization name={name} organization={organization} />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return <Home />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/profile/:username"
                render={(props) => {
                  const clientUsername = props.match.params.username;
                  if (role !== Role.LoggedOut) {
                    return <ClientProfilePage username={clientUsername} />;
                  }
                  return <Home />;
                }}
              />
              <SignUpRouter role={role} />
              <Route path="/error">
                <Error />
              </Route>
              <Route>
                <Redirect to="/error" />
              </Route>
            </Switch>
          </div>
          <Footer />
        </div>
        </UserContext.Provider>
      </Router>
    );
  }
}

export default App;
