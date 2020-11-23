import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Geocode from 'react-geocode';
import MapComponent from './MapComponent';
import getServerURL from '../../serverOverride';

interface Props {
  alert: any,
}

interface State {
  organizations: any,
  displayMap: boolean,
  zipcodeSearch: string,
  zipcodeLatLng: any,
}

const APIKey = 'AIzaSyBS1seMnrtdwOxpcoezbN_QVwVp797Dxyw';

Geocode.setApiKey(APIKey);
Geocode.setLanguage('en');
Geocode.setRegion('us');
// Geocode.enableDebug();

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
    fetch(`${getServerURL()}/get-all-orgs `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        userTypes: [],
        organizations: [],
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          organizations,
        } = JSON.parse(responseJSON);
        this.getOrganizationsLatLng(organizations);
      });
  }

  onHandleChangeZipcode(event: any) {
    this.setState({ zipcodeSearch: event.target.value });
  }

  onSubmitZipcode(event: any) {
    event.preventDefault();
    this.geocodeZipcode();
  }

  // gets latitude and longitute from address and updates the organization
  getOrganizationsLatLng(organizations: Array<any>) {
    const promises: any[] = [];
    organizations.forEach((org) => {
      const fullAddress = `${org.orgStreetAddress} ${org.orgCity} ${org.orgState}`;
      promises.push(Geocode.fromAddress(fullAddress));
      const formattedAddress = `${org.orgStreetAddress}, ${org.orgCity}, ${org.orgState} ${org.orgZipcode}`;
      org.orgAddress = formattedAddress;
    });

    Promise.allSettled(promises)
      .then((responses) => {
        responses.map((response, index) => {
          if (response.status === 'fulfilled') {
            const { lat, lng } = response.value.results[0].geometry.location;
            organizations[index].orgLat = lat;
            organizations[index].orgLng = lng;
          }
        });
        this.setState({
          organizations,
        });
      });
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
        const { status } = responseJSON;

        if (status === 'OK') {
          const zipcodeLatLng = responseJSON.results[0].geometry.location;
          this.setState({
            displayMap: true,
            zipcodeLatLng,
          });
        } else {
          const {
            alert,
          } = this.props;
          alert.show('Invalid zip code');
        }
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
      <div className="container">
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">Find Nearby Organizations</h1>
        </div>
        <form onSubmit={this.onSubmitZipcode}>
          <div className="input-group mb-3 mt-5">
            <input type="text" className="form-control form-purple" placeholder="Enter your zipcode here" value={zipcodeSearch} onChange={this.onHandleChangeZipcode} />
            <div className="input-group-append">
              <button className="btn btn-primary btn-primary-theme rounded-0" type="submit">Search</button>
            </div>
          </div>
        </form>
        {displayMap
          ? (
            <MapComponent
              organizations={organizations}
              lat={zipcodeLatLng.lat}
              lng={zipcodeLatLng.lng}
              googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${APIKey}&v=3.exp&libraries=geometry,drawing,places`}
              loadingElement={<div style={{ height: '100%' }} />}
              containerElement={<div style={{ height: '400px' }} />}
              mapElement={<div style={{ height: '100%' }} />}
            />
          )
          : <div />}
      </div>
    );
  }
}

export default withAlert()(FindOrganization);
