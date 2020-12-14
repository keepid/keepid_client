import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import './static/styles/App.scss';
import { Helmet } from 'react-helmet';
import ReactGA from 'react-ga';
import { Type } from 'react-bootstrap-table2-editor';
import Header from './components/Base/Header';
import UploadDocs from './components/PDF/UploadDocs';
import ClientLanding from './components/LandingPages/ClientLanding';
import Applications from './components/PDF/Applications';
import Error from './components/Base/Error';
import AdminPanel from './components/AccountSecurity/AdminPanel';
import MyOrganization from './components/AccountSecurity/MyOrganization';
import DevPanel from './components/LandingPages/DeveloperLanding';
import MyDocuments from './components/PDF/MyDocuments';
import OurTeam from './components/AboutUs/OurTeam';
import Role from './static/Role';
import MyAccount from './components/AccountSecurity/MyAccount';
import Footer from './components/Base/Footer';
import OurPartners from './components/AboutUs/OurPartners';
import OurMission from './components/AboutUs/OurMission';
import WorkerLanding from './components/LandingPages/WorkerLanding';
import getServerURL from './serverOverride';

import IssueReport from './components/AccountSecurity/IssueReport';
import LoginPage from './components/AccountSecurity/LoginPage';
import ForgotPassword from './components/AccountSecurity/ForgotPassword';
import FindOrganization from './components/OrgFinder/FindOrganization';
import Home from './components/Base/Home';
import ResetPassword from './components/AccountSecurity/ResetPassword';
import PrivacyPolicy from './components/AboutUs/PrivacyPolicy';
import EULA from './components/AboutUs/EULA';
import CompleteSignupFlow from './components/SignUp/CompleteSignupFlow';
import SignupBrancher from './components/SignUp/SignupBrancher';
import Careers from './components/AboutUs/Careers';
import AdminDashboard from './components/AccountSecurity/AdminDashboard';
import Hubspot from './components/AboutUs/Hubspot';
import InviteSignupJWT from './components/SignUp/InviteSignupJWT';
import PersonSignupFlow from './components/SignUp/PersonSignupFlow';
import AutoLogout from './components/AccountSecurity/AutoLogout';
import Table from './components/Base/Table';

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

// for test table
const products = [
  {
    name: 'TV',
    price: 1000,
  },
  {
    name: 'Mobile',
    price: 500,
  },
  {
    name: 'Book',
    price: 20,
  }];

const data: any = [];
for (let i = 0; i < 100; i++) {
  const value = products[i % products.length];
  const newValue = {
    name: value.name,
    price: value.price,
    id: i,
  };
  data.push(newValue);
}

const columns = [{
  dataField: 'id',
  text: 'Product ID',
},
{
  dataField: 'name',
  text: 'Product Name',
  editor: {
    type: Type.SELECT,
    options: [{
      value: 'TV',
      label: 'TV',
    }, {
      value: 'Mobile',
      label: 'Mobile',
    }, {
      value: 'Book',
      label: 'Book',
    }],
  },
}, {
  dataField: 'price',
  text: 'Product Price',
  sort: true,
}];
const cantEdit = new Set([0]);
const emptyInfo = {
  onPress: () => console.log('test'),
  label: 'Invite members',
  description: 'There are no members in this organization.',
};

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
                path="/table-test"
                render={() => <Table columns={columns} data={data} cantEditCols={cantEdit} canModify modRoute="/table" emptyInfo={emptyInfo} />}
              />
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
                    return (<ClientLanding />);
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
                    : <LoginPage isLoggedIn={role !== Role.LoggedOut} logIn={this.logIn} logOut={this.logOut} role={role} autoLogout={autoLogout} setAutoLogout={this.setAutoLogout} />
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
                    return (<AdminPanel name={name} organization={organization} username={username} />);
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
              <Route path="/hubspot">
                <Hubspot />
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
