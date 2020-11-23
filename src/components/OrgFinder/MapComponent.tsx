import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import uuid from 'react-uuid';
import OrganizationMarker from './OrganizationMarker';

interface Props {
  organizations: any,
  lat: number,
  lng: number,
}

interface State {

}

class MapComponent extends Component<Props, State> {
  render() {
    const {
      organizations,
      lat,
      lng,
    } = this.props;

    return (
      <GoogleMap
        defaultZoom={12}
        center={{
          lat,
          lng,
        }}
      >
        {organizations.map(
          (organization, index) => (
            <OrganizationMarker
              key={uuid()}
              lat={organization.orgLat}
              lng={organization.orgLng}
              orgName={organization.orgName}
              address={organization.orgAddress}
              phone={organization.orgPhoneNumber}
              email={organization.orgEmail}
              website={organization.orgWebsite}
            />
          ),
        )}
      </GoogleMap>
    );
  }
}

export default withScriptjs(withGoogleMap(MapComponent));
