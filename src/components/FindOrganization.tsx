import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker';

interface Props {

}

interface State {
  organizations: any,
  displayMap: boolean,
  zipcodeSearch: string,
  zipcodeLatLng: any,
}

const APIKey = 'AIzaSyBS1seMnrtdwOxpcoezbN_QVwVp797Dxyw';

class FindOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizations: [],
      displayMap: false,
      zipcodeSearch: '',
      zipcodeLatLng: {},
    };
    this.getOrganizations = this.getOrganizations.bind(this);
    this.geocodeZipcode = this.geocodeZipcode.bind(this);
    this.onHandleChangeZipcode = this.onHandleChangeZipcode.bind(this);
    this.onSubmitZipcode = this.onSubmitZipcode.bind(this);
  }

  componentDidMount() {
    this.getOrganizations();
  }

  getOrganizations() {
    const organizations = [
      {
        orgName: 'Broad Street Ministries',
        lat: 39.9460872,
        lng: -75.1644793,
        address: '315 S Broad St, Philadelphia, PA 19107',
        phone: '',
        email: '',
      },
    ];
    this.setState({ organizations });
  }

  onHandleChangeZipcode(event: any) {
    this.setState({ zipcodeSearch: event.target.value });
  }

  onSubmitZipcode(event: any) {
    event.preventDefault();
    this.geocodeZipcode();
  }

  geocodeZipcode() {
    const {
      zipcodeSearch,
    } = this.state;
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json?'); // Do in OrganizationSignup
    const search = `postal_code:${zipcodeSearch}`;
    const urlParams = {
      components: search,
      key: APIKey,
    };
    Object.keys(urlParams).forEach((key) => url.searchParams.append(key, urlParams[key]));
    fetch(url.toString(), {
      method: 'GET',
    }).then((response) => response.json())
      .then((responseJSON) => {
        const zipcodeLatLng = responseJSON.results[0].geometry.location;
        this.setState({
          displayMap: true,
          zipcodeLatLng,
        });
      });
  }

  render() {
    const {
      displayMap,
      zipcodeSearch,
      organizations,
      zipcodeLatLng,
    } = this.state;
    return (
      <div>
        <form onSubmit={this.onSubmitZipcode}>
          <label htmlFor="zipcodeInput">
            Find Nearby Organizations by Zipcode
            <input
              id="zipcodeInput"
              type="text"
              value={zipcodeSearch}
              onChange={this.onHandleChangeZipcode}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
        {displayMap
          ? (
            <div style={{ height: '100vh', width: '100%' }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: APIKey }}
                center={{
                  lat: zipcodeLatLng.lat,
                  lng: zipcodeLatLng.lng,
                }}
                zoom={12}
              >
                {organizations.map(
                  (organization) => (
                    <Marker
                      lat={organization.lat}
                      lng={organization.lng}
                      orgName={organization.orgName}
                      address={organization.address}
                      phone={organization.phone}
                      email={organization.email}
                    />
                  ),
                )}
              </GoogleMapReact>
            </div>
          )
          : <div />}
      </div>
    );
  }
}

export default FindOrganization;
