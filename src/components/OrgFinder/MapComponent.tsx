import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import uuid from 'react-uuid';
import OrganizationMarker from './OrganizationMarker';

interface Props {
  organizations: any,
  lat: number,
  lng: number,
}

function MapComponent(props: Props): React.ReactElement {
  const {
    organizations,
    lat,
    lng,
  } = props;

  return (
    <GoogleMap
      defaultZoom={12}
      center={{
        lat,
        lng,
      }}
    >
      {organizations.map(
        (organization) => (
          <OrganizationMarker
            key={uuid()}
            lat={organization.orgLat}
            lng={organization.orgLng}
            orgName={organization.orgName}
            address={organization.orgAddress}
            phone={organization.orgPhoneNumber}
            email={organization.orgEmail}
            website={organization.orgWebsite}
            showInfo={organization.showInfo}
          />
        ),
      )}
    </GoogleMap>
  );
}

export default withScriptjs(withGoogleMap(MapComponent));
