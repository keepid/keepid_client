import '../../static/styles/ClientLanding.scss';

import React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import QuickAccessCards from '../QuickAccess/QuickAccessCards';
import ClientDashboardSummaryCards from './ClientDashboardSummaryCards';

interface Props extends RouteComponentProps {
  name: String;
  username: String;
}

function ClientLanding(_props: Props): React.ReactElement {
  return (
    <div id="Buttons" className="container pt-5">
      <Helmet>
        <title>Home</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="mb-3">
        <QuickAccessCards />
      </div>
      <ClientDashboardSummaryCards />
    </div>
  );
}

export default withRouter(ClientLanding);
