// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './static/styles/App.scss';

// import './static/styles/Table.scss';
// import './static/styles/BaseCard.scss';
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
import MyOrganization from './components/AccountSettings/MyOrganization';
import CreateApplication from './components/Applications/CreateApplication';
import CreateApplicationFromDocument from './components/Applications/CreateApplicationFromDocument';
import ViewApplications from './components/Applications/ViewApplications';
import CallsPage from './components/Communications/CallsPage';
import MessageBoard from './components/Communications/MessageBoard';
import MyDocuments from './components/Documents/MyDocuments';
import UploadDocumentsPage from './components/Documents/UploadDocumentsPage';
import Error from './components/Error';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home/index';
import InstallPromptContainer from './components/InstallPrompt/InstallPromptContainer';
import IssueReport from './components/IssueReport';
import AdminDashboard from './components/LandingPages/AdminDashboard';
import ClientLanding from './components/LandingPages/ClientLanding';
import DevPanel from './components/LandingPages/DeveloperLanding';
import WorkerLanding from './components/LandingPages/WorkerLanding';
import ProfilePage from './components/Profile/ProfilePage';
import QuickAccessRouter from './components/QuickAccess/QuickAccess.router';
import EnrollClientPage from './components/SignUp/EnrollClient';
import EnrollWorkerPage from './components/SignUp/EnrollWorker';
import SignUpRouter, {
  paths as SignUpRouterPaths,
} from './components/SignUp/SignUp.router';
import ForgotPassword from './components/UserAuthentication/ForgotPassword';
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
    if (jsonData) {
      const data = JSON.parse(jsonData);
      this.state = {
        role: data.role,
        username: data.username,
        name: data.name,
        organization: data.organization,
      };
    } else {
      this.state = {
        role: Role.LoggedOut,
        username: '',
        name: '',
        organization: '',
      };
    }
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
    this.refreshAuthFromServer();
    // Listen for in-app profile updates (e.g. name change in Account
    // Information). The handler hits /authenticate again so App.state.name
    // (which the sidebar Profile Title and other top-level chrome read)
    // stays in sync without a full page reload. Dispatched by
    // EssentialAccountSection after a successful /update-user-profile
    // that touched firstName / lastName.
    window.addEventListener('keepid:profile-updated', this.handleProfileUpdated);
  }

  componentWillUnmount() {
    window.removeEventListener('keepid:profile-updated', this.handleProfileUpdated);
  }

  handleProfileUpdated = () => {
    this.refreshAuthFromServer();
  };

  refreshAuthFromServer = () => {
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
            const serverName = `${firstName} ${lastName}`;
            const identityMismatch =
              !(role() === data.role
                && username === data.username
                && organization === data.organization);
            if (identityMismatch && data.name === serverName) {
              this.logOut();
            } else if (data.name !== serverName) {
              // Identity matches but the name drifted — happens after
              // /update-user-profile or /change-account-setting changes
              // first/last. Sync App.state.name (and sessionStorage) to
              // the server's truth so the sidebar Profile Title reflects
              // the new name immediately.
              this.logIn(role(), username, organization, serverName);
            }
          } else {
            // Server has a valid session but client has no local data.
            // This happens after Google OAuth login redirect — trust the
            // server and log in locally instead of destroying the session.
            this.logIn(role(), username, organization, `${firstName} ${lastName}`);
          }
        } else if (this.state.role !== Role.LoggedOut) {
          this.logOut();
        } else {
          this.logOut();
        }
      })
      .catch((e) => {
        console.log('Server is not running: ', e);
      });
  };

  render() {
    const { role, username, name, organization } = this.state;
    const renderHome = () => (
      <Home
        logIn={this.logIn}
        logOut={this.logOut}
        role={role}
      />
    );
    return (
      <Router>
        <UserContext.Provider value={{ username: this.state.username, organization: this.state.organization }}>
        <div className="App tw-flex tw-flex-col tw-min-h-screen">
          <div className="app tw-flex-1 tw-pb-12">
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
            {/* PWA install nudge — opens once per login session.
                Triggered by username change; lib/pwa handles platform + dismissal logic. */}
            <InstallPromptContainer
              triggerKey={role !== Role.LoggedOut ? username || null : null}
            />
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
                  return renderHome();
                }}
              />
              <Route
                path="/eula"
                render={() => {
                  if (role === Role.Admin || role === Role.Director) {
                    return <AdminDashboard />;
                  }
                  return renderHome();
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
                        logOut={this.logOut}
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
                  return renderHome();
                }}
              />
              <Route
                path="/find-organizations"
                render={() => <Redirect to="/home" />}
              />
              <Route
                path="/login"
                render={() => <Redirect to="/home" />}
              />

              {/* Admin Panel route removed - functionality moved to My Organization page */}
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
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/phone-upload"
                render={() => (
                  <UploadDocumentsPage
                    userRole={Role.Client}
                    username=""
                  />
                )}
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
                      <UploadDocumentsPage
                        userRole={Role.Client}
                        username={clientUsername}
                        viewerUsername={username}
                        viewerName={name}
                        organizationName={organization}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
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
                    role === Role.Director ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return (
                      <UploadDocumentsPage
                        userRole={role}
                        username={username}
                        viewerUsername={username}
                        viewerName={name}
                        organizationName={organization}
                      />
                    );
                  }
                  return renderHome();
                }}
              />
              <Route
                path="/my-documents/:clientUsername"
                render={(props) => {
                  const { clientUsername } = props.match.params;
                  const locState = props.location.state as { clientName?: string } | undefined;
                  if (
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer ||
                    role === Role.Client
                  ) {
                    return (
                      <MyDocuments
                        userRole={Role.Client}
                        viewerRole={role}
                        username={clientUsername}
                        clientName={locState?.clientName}
                        viewerUsername={username}
                        viewerName={name}
                        organizationName={organization}
                      />
                    );
                  }
                  return renderHome();
                }}
              />
              <Route
                path="/my-documents"
                render={() => {
                  if (
                    role === Role.Client ||
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return (
                      <MyDocuments
                        userRole={role}
                        viewerRole={role}
                        username={username}
                        viewerUsername={username}
                        viewerName={name}
                        organizationName={organization}
                      />
                    );
                  }
                  return renderHome();
                }}
              />
              <Route
                path="/applications/create-from-document"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Worker ||
                    role === Role.Developer
                  ) {
                    return (
                      <CreateApplicationFromDocument
                        userRole={role}
                        viewerName={name}
                        viewerUsername={username}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
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
                      <CreateApplication userRole={role} />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
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
                      <ViewApplications
                        name={name}
                        organization={organization}
                        username={username}
                        role={role}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                exact
                path="/communications"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker
                  ) {
                    return <CallsPage />;
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/communications/calls"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker
                  ) {
                    return <CallsPage />;
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/communications/message-board-preview"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Director ||
                    role === Role.Worker
                  ) {
                    return (
                      <div className="tw-w-full tw-max-w-5xl tw-mx-auto tw-px-4 tw-py-6">
                        <MessageBoard
                          username="demo-client"
                          clientName="Maria Rivera"
                          phone="+12155550142"
                        />
                      </div>
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
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
                    return <Redirect to="/profile" />;
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/profile"
                exact
                render={() => {
                  if (role !== Role.LoggedOut) {
                    return <ProfilePage />;
                  }
                  return renderHome();
                }}
              />
              <Route
                path="/my-organization"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (
                      <MyOrganization
                        name={name}
                        organization={organization}
                        role={role}
                      />
                    );
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/profile/:username"
                render={(props) => {
                  const clientUsername = props.match.params.username;
                  if (role !== Role.LoggedOut) {
                    return <ProfilePage targetUsername={clientUsername} />;
                  }
                  return renderHome();
                }}
              />
              <Route
                path="/enroll-client"
                render={() => {
                  if (
                    role === Role.Worker ||
                    role === Role.Admin ||
                    role === Role.Director
                  ) {
                    return <EnrollClientPage />;
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/enroll-worker"
                render={() => {
                  if (
                    role === Role.Admin ||
                    role === Role.Director
                  ) {
                    return <EnrollWorkerPage />;
                  }
                  if (role === Role.LoggedOut) {
                    return renderHome();
                  }
                  return <Redirect to="/error" />;
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
          <Route
            render={({ location }) => (
              location.pathname.startsWith('/communications') ? null : <Footer />
            )}
          />
        </div>
        </UserContext.Provider>
      </Router>
    );
  }
}

export default App;
