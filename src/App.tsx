import React from 'react';
import IdleTimer from 'react-idle-timer';
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
import BugReport from './components/BugReport';
import LoginPage from './components/LoginPage';
import ForgotPassword from './components/ForgotPassword';
import FindOrganization from './components/FindOrganization';
import IdleTimeOutModal from './components/IdleTimeOutModal';

interface State {
  role: Role,
  username: string,
  name: string,
  organization: string,
  timeout: number,
  showModal: boolean,
  remaining: number,
}

const timeUntilWarn: number = 1000 * 30;
const timeFromWarnToLogout: number = 1000 * 15;
const timeoutTotal: number = timeUntilWarn + timeFromWarnToLogout;


class App extends React.Component<{}, State, {}> {

  private idleTimer;

  constructor(props: {}) {
    super(props);
    this.idleTimer = null;
    this.state = {
      role: Role.LoggedOut, 
      username: '',
      name: '',
      organization: '',
      timeout: timeoutTotal,
      showModal: false,
      remaining: 0
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);

    this._onActive = this._onActive.bind(this);
    this._onAction = this._onAction.bind(this);
    this._onIdle = this._onIdle.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount () {
    setInterval(() => {
      const {
        role,
      } = this.state;

      // if the user is currently logged in - check whether enough time has elapsed to show warning
      if (role !== Role.LoggedOut) {

        this.setState({
          remaining: this.idleTimer.getRemainingTime(),
        });

        const {
          remaining
        } = this.state;

        if (remaining < timeFromWarnToLogout) {
          this.setState({
            showModal: true,
          });
        }
      } 
    }, 1000);
  }

  // user did something
  _onAction() {
    this.setState({showModal: false})
  }
   
  // user is active
  _onActive() {
    this.setState({showModal: false})
  }
 
  // user idle for set amount of time
  _onIdle() {
    const {
      role,
    } = this.state;

    // if the user is currently logged in
    if (role !== Role.LoggedOut) {
      this.handleLogout();
    }
  }

  // closing idle modal warning
  handleClose() {
    this.idleTimer.reset();
    this.setState({
      showModal: false,
    });
  }

  handleLogout() {
    this.setState({showModal: false})
    this.logOut();
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
      timeout,
      showModal,
    } = this.state;

    return (                
      <Router>
        <div className="App">
          <div className="app">
            <Helmet>
              <title>Keep.id</title>
              <meta name="description" content="Securely Combating Homelessness" />
            </Helmet>
            <Header isLoggedIn={role !== Role.LoggedOut} logIn={this.logIn} logOut={this.logOut} role={role} />
            
            {role !== Role.LoggedOut ? (
            <div>
              <IdleTimer
                key='idleTimer'
                startOnMount={ true }
                ref={ref => { this.idleTimer = ref }}
                element={document}
                onActive={this._onActive}
                onIdle={this._onIdle}
                onAction={this._onAction}
                debounce={250}
                timeout={timeout} 
              /> 
              <IdleTimeOutModal 
                showModal={showModal}
                handleClose={this.handleClose} 
              />
            </div>) : null}

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
                  if (role === Role.Director || role === Role.Admin || role === Role.Worker) {
                    return (<WorkerLanding name={name} organization={organization} username={username} role={role} />);
                  }
                  if (role === Role.Client) {
                    return (<ClientLanding />);
                  }
                  return (<Redirect to="/login" />);
                }}
              />
              <Route
                path="/find-organization"
                render={() => (<FindOrganization />)}
              />
              <Route
                path="/login"
                render={() => (
                  role !== Role.LoggedOut
                    ? <Redirect to="/home" />
                    : <Login />
                )}
              />
              <Route
                path="/login-page"
                render={() => (
                  role !== Role.LoggedOut
                    ? <Redirect to="/home" />
                    : <LoginPage isLoggedIn={role !== Role.LoggedOut} logIn={this.logIn} logOut={this.logOut} role={role} />
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
                      return (role === Role.Director
                        ? <PersonSignup userRole={role} personRole={Role.Admin} />
                        : <Redirect to="/error" />
                      );
                    case 'worker':
                      return (role === Role.Director || role === Role.Admin
                        ? <PersonSignup userRole={role} personRole={Role.Worker} />
                        : <Redirect to="/error" />
                      );
                    case 'volunteer':
                      return (role === Role.Director || role === Role.Admin || role === Role.Worker
                        ? <PersonSignup userRole={role} personRole={Role.Volunteer} />
                        : <Redirect to="/error" />
                      );
                    case 'client':
                      return (role === Role.Director || role === Role.Admin || role === Role.Worker || role === Role.Volunteer
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
                  if (role === Role.Director || role === Role.Admin) {
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
              <Route path="/bug-report">
                <BugReport />
              </Route>
              <Route path="/forgot-password">
                <ForgotPassword />
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
              <Route>
                <Redirect to="/error" />
              </Route>
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
