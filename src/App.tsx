import './static/styles/App.scss';
import './static/styles/Table.scss';
import './static/styles/BaseCard.scss';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import {
  BrowserRouter as Router, Redirect, Route, Switch,
} from 'react-router-dom';

import Careers from './components/AboutUs/Careers';
import EULA from './components/AboutUs/EULA';
import OurMission from './components/AboutUs/OurMission';
import OurPartners from './components/AboutUs/OurPartners';
import OurTeam from './components/AboutUs/OurTeam';
import PrivacyPolicy from './components/AboutUs/PrivacyPolicy';
import AdminPanel from './components/AccountSettings/AdminPanel';
import ClientProfilePage from './components/AccountSettings/ClientProfilePage';
import MyAccount from './components/AccountSettings/MyAccount';
import MyOrganization from './components/AccountSettings/MyOrganization';
import Applications from './components/Applications/Applications';
import CompleteBillingFlow from './components/Billing/CompleteBillingFlow';
import MyDocuments from './components/Documents/MyDocuments';
import UploadDocs from './components/Documents/UploadDocs';
import Error from './components/Error';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home';
import IssueReport from './components/IssueReport';
import AdminDashboard from './components/LandingPages/AdminDashboard';
import ClientLanding from './components/LandingPages/ClientLanding';
import DevPanel from './components/LandingPages/DeveloperLanding';
import WorkerLanding from './components/LandingPages/WorkerLanding';
import FindOrganization from './components/OrgFinder/FindOrganization';
import CompleteSignupFlow from './components/SignUp/CompleteSignupFlow';
import InviteSignupJWT from './components/SignUp/InviteSignupJWT';
import PersonSignupFlow from './components/SignUp/PersonSignupFlow';
import SignupBrancher from './components/SignUp/SignupBrancher';
import AutoLogout from './components/UserAuthentication/AutoLogout';
import ForgotPassword from './components/UserAuthentication/ForgotPassword';
import LoginPage from './components/UserAuthentication/LoginPage';
import ResetPassword from './components/UserAuthentication/ResetPassword';
import getServerURL from './serverOverride';
import Role from './static/Role';

const publicKey = process.env.REACT_APP_PUBLISHABLE_KEY;
let stripePromise;

if (publicKey) {
  stripePromise = loadStripe(publicKey);
} else {
  console.log('Stripe publishable key not found');
}

window.onload = () => {
  ReactGA.initialize('UA-176859431-1');
  ReactGA.pageview(window.location.pathname + window.location.search);
};

interface State {
  role: Role,
  username: string,
  name: string,
  organization: string,
  autoLogout: boolean,
}

class App extends React.Component<{}, State, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      role: Role.LoggedOut,
      username: '',
      name: '',
      organization: '',
      autoLogout: false,
    };
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
  }

  componentDidMount() {
    fetch(`${getServerURL()}/authenticate`, {
      method: 'POST',
      credentials: 'include',
    }).then((response) => response.json())
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
              case 'Director': return Role.Director;
              case 'Admin': return Role.Admin;
              case 'Worker': return Role.Worker;
              case 'Client': return Role.Client;
              case 'Developer': return Role.Developer;
              default: return Role.LoggedOut;
            }
          };
          this.logIn(role(), username, organization, `${firstName} ${lastName}`); // Change
        }
      });
  }

  render() {
    const {
      role,
      username,
      name,
      organization,
      autoLogout,
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
            {role !== Role.LoggedOut ? <AutoLogout logOut={this.logOut} setAutoLogout={this.setAutoLogout} /> : null}

            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Redirect to="/home" />
                )}
              />
              <Route
                path="/home"
                render={() => {
                  if (role === Role.Director || role === Role.Admin || role === Role.Worker) {
                    return (<WorkerLanding name={name} organization={organization} username={username} role={role} />);
                  }
                  if (role === Role.Client) {
                    return (<ClientLanding name={name} username={username} />);
                  }
                  if (role === Role.Developer) {
                    return (<DevPanel name={name} organization={organization} username={username} role={role} />);
                  }
                  return <Home />;
                }}
              />
              <Route
                path="/find-organizations"
                render={() => (<FindOrganization />)}
              />
              <Route
                path="/login"
                render={() => (
                  role !== Role.LoggedOut
                    ? <Redirect to="/home" />
                    : (
                      <LoginPage
                        isLoggedIn={role !== Role.LoggedOut}
                        logIn={this.logIn}
                        logOut={this.logOut}
                        role={role}
                        autoLogout={autoLogout}
                        setAutoLogout={this.setAutoLogout}
                      />
                    )
                )}
              />
              <Route path="/signup-branch">
                <SignupBrancher />
              </Route>
              <Route path="/organization-signup">
                <CompleteSignupFlow role={Role.Admin} />
              </Route>
              <Route
                path="/person-signup/:roleString"
                render={(props) => {
                  switch (props.match.params.roleString) {
                    case 'admin':
                      return (role === Role.Director
                        ? <PersonSignupFlow userRole={role} personRole={Role.Admin} />
                        : <Redirect to="/error" />
                      );
                    case 'worker':
                      return (role === Role.Director || role === Role.Admin
                        ? <PersonSignupFlow userRole={role} personRole={Role.Worker} />
                        : <Redirect to="/error" />
                      );
                    case 'volunteer':
                      return (role === Role.Director || role === Role.Admin || role === Role.Worker
                        ? <PersonSignupFlow userRole={role} personRole={Role.Volunteer} />
                        : <Redirect to="/error" />
                      );
                    case 'client':
                      return (role === Role.Director || role === Role.Admin || role === Role.Worker || role === Role.Volunteer
                        ? <PersonSignupFlow userRole={role} personRole={Role.Client} />
                        : <Redirect to="/error" />
                      );
                    default:
                      return <Redirect to="/error" />;
                  }
                }}
              />
              <Route
                path="/admin-panel"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (<AdminPanel name={name} organization={organization} username={username} role={role} />);
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/dev-panel"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (<DevPanel userRole={role} name={name} organization={organization} username={username} />);
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/upload-document"
                render={() => {
                  if (role === Role.Client || role === Role.Admin || role === Role.Director) {
                    return <UploadDocs userRole={role} />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/my-documents"
                render={() => {
                  if (role === Role.Client || role === Role.Admin || role === Role.Director) {
                    return <MyDocuments userRole={role} username={name} />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/applications"
                render={() => {
                  if (role === Role.Client) {
                    return <Applications name={name} organization={organization} username={username} />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route path="/our-team">
                <OurTeam />
              </Route>
              <Route path="/our-partners">
                <OurPartners />
              </Route>
              <Route path="/our-mission">
                <OurMission />
              </Route>
              <Route path="/privacy-policy">
                <PrivacyPolicy />
              </Route>
              <Route path="/eula">
                <EULA />
              </Route>
              <Route path="/dashboard-test">
                <AdminDashboard />
              </Route>
              <Route path="/careers">
                <Careers />
              </Route>
              <Route path="/issue-report">
                <IssueReport />
              </Route>
              <Route path="/forgot-password">
                <ForgotPassword />
              </Route>
              <Route path="/reset-password/:jwt">
                <ResetPassword />
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
              <Route
                path="/my-organization"
                render={() => {
                  if (role === Role.Director || role === Role.Admin) {
                    return (<MyOrganization name={name} organization={organization} />);
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route path="/create-user/:jwt">
                <InviteSignupJWT />
              </Route>
              <Route
                path="/profile/:username"
                render={(props) => {
                  const clientUsername = props.match.params.username;
                  if (role !== Role.LoggedOut) {
                    return <ClientProfilePage username={clientUsername} />;
                  }
                  return <Redirect to="/error" />;
                }}
              />
              <Route
                path="/billing"
                render={() => {
                  if (role !== Role.LoggedOut) {
                    return (
                      <Elements stripe={stripePromise}>
                        <CompleteBillingFlow />
                      </Elements>
                    );
                  }
                  return <Redirect to="/error" />;
                }}
              />
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
