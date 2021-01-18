import React from 'react';
import { Helmet } from 'react-helmet';
import HubspotForm from 'react-hubspot-form';
import { withAlert } from 'react-alert';

interface Props{
  alert: any
}

interface State {}

class Hubspot extends React.Component<Props, State> {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>Hubspot</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <HubspotForm
          portalId="8293567"
          formId="d452f166-31d3-455d-b3f7-b0afbe967f46"
          loading={<div>Loading...</div>}
        />
      </div>
    );
  }
}

export default withAlert(Hubspot);
