import '../../static/styles/ClientLanding.scss';

import React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Role from '../../static/Role';
import QuickAccessCards from '../QuickAccess/QuickAccessCards';
import ClientDashboardSummaryCards from './ClientDashboardSummaryCards';

interface Props extends RouteComponentProps {
  name: String;
  username: String;
  role: Role;
  organization: string;
}

function ClientLanding({ role, organization }: Props): React.ReactElement {
  return (
    <div id="Buttons" className="container pt-5">
      <Helmet>
        <title>Home</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="mb-3">
        <QuickAccessCards />
      </div>
      <ClientDashboardSummaryCards role={role} organization={organization} />
    </div>
  );
}

export default withRouter(ClientLanding);
