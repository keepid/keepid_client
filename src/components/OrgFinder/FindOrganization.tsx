import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Geocode from 'react-geocode';
import Card from 'react-bootstrap/Card';
import MapComponent from './MapComponent';
import getServerURL from '../../serverOverride';

interface Props {
  alert: any,
}

interface State {
  organizationsWithinDistance: any[],
  displayMap: boolean,
  zipcodeSearch: string,
  zipcodeLatLng: any,
  distance: number,
  searchLoading: boolean,
}

const APIKey = 'AIzaSyBS1seMnrtdwOxpcoezbN_QVwVp797Dxyw';

Geocode.setApiKey(APIKey);
Geocode.setLanguage('en');
Geocode.setRegion('us');
// Geocode.enableDebug(); // for debugging

// helper function to convert degree to radian
const degToRad = (degree: number): number => degree * (Math.PI / 180);

// haversine formula
const getDistanceInKM = (coordinate1: number[], coordinate2: number[]): number => {
  const lat1 = coordinate1[0];
  const lat2 = coordinate2[0];
  const lng1 = coordinate1[1];
  const lng2 = coordinate2[1];
  const avgEarthRadiusInKM = 6371;
  const radLat = degToRad(lat2 - lat1);
  const radLng = degToRad(lng2 - lng1);
  const a = Math.sin(radLat / 2) * Math.sin(radLat / 2)
    + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2))
    * Math.sin(radLng / 2) * Math.sin(radLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distInKM = avgEarthRadiusInKM * c;
  return distInKM;
};

class FindOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizationsWithinDistance: [],
      displayMap: false,
      zipcodeSearch: '',
      zipcodeLatLng: {},
      distance: 25, // get organizations within this distance in km to the entered zipcode
      searchLoading: false,
    };
    this.getOrganizations = this.getOrganizations.bind(this);
    this.searchOrganizationsByZipcode = this.searchOrganizationsByZipcode.bind(this);
    this.onHandleChangeZipcode = this.onHandleChangeZipcode.bind(this);
    this.onSubmitZipcode = this.onSubmitZipcode.bind(this);
    this.handleOrgCardClick = this.handleOrgCardClick.bind(this);
  }

  onHandleChangeZipcode(event: any) {
    this.setState({ zipcodeSearch: event.target.value });
  }

  // only show info for one org on card click or else the map view glitches
  handleOrgCardClick(org: any, index: number) {
    const {
      organizationsWithinDistance,
    } = this.state;
    for (let i = 0; i < organizationsWithinDistance.length; i += 1) {
      if (i === index) {
        organizationsWithinDistance[i].showInfo = true;
      } else {
        organizationsWithinDistance[i].showInfo = false;
      }
    }
    this.setState({
      organizationsWithinDistance,
    });
  }

  onSubmitZipcode(event: any) {
    event.preventDefault();
    this.setState({
      searchLoading: true,
    });
    this.searchOrganizationsByZipcode();
  }

  getOrganizations(zipcodeLatLng: number[]) {
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
        this.getOrganizationsWithinDistance(organizations, zipcodeLatLng);
      });
  }

  // gets all organizations within a fixed distance in km
  // also gets latitude and longitute from address and updates the organization
  getOrganizationsWithinDistance(organizations: any[], zipcodeLatLng: number[]) {
    const {
      distance,
    } = this.state;
    const promises: any[] = [];
    const organizationsUpdated: any[] = [];
    organizations.forEach((org) => {
      const orgUpdated = org;
      const fullAddress = `${org.orgStreetAddress} ${org.orgCity} ${org.orgState}`;
      promises.push(Geocode.fromAddress(fullAddress));
      const formattedAddress = `${org.orgStreetAddress}, ${org.orgCity}, ${org.orgState} ${org.orgZipcode}`;
      orgUpdated.orgAddress = formattedAddress;
      orgUpdated.showInfo = false;
      let formattedPhoneNumber = '';
      if (org.orgPhoneNumber.length === 10) {
        formattedPhoneNumber = `(${org.orgPhoneNumber.slice(0, 3)}) ${org.orgPhoneNumber.slice(3, 6)}-${org.orgPhoneNumber.slice(6, 10)}`;
      } else {
        formattedPhoneNumber = org.orgPhoneNumber;
      }
      orgUpdated.orgPhoneNumber = formattedPhoneNumber;
      organizationsUpdated.push(orgUpdated);
    });

    const organizationsWithinDistance: any[] = [];
    Promise.allSettled(promises)
      .then((responses) => {
        for (let i = 0; i < responses.length; i += 1) {
          const response = responses[i];
          if (response.status === 'fulfilled') {
            const { lat, lng } = response.value.results[0].geometry.location;
            organizationsUpdated[i].orgLat = lat;
            organizationsUpdated[i].orgLng = lng;
            const orgCoordinate = [lat, lng];
            const distBetween = getDistanceInKM(orgCoordinate, zipcodeLatLng);
            if (distBetween <= distance) {
              organizationsWithinDistance.push(organizationsUpdated[i]);
            }
          }
        }
        this.setState({
          organizationsWithinDistance,
          displayMap: true,
          searchLoading: false,
        });
      });
  }

  // takes in inputted zipcode and returns organizations within distance
  searchOrganizationsByZipcode() {
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
            zipcodeLatLng,
          });
          this.getOrganizations([zipcodeLatLng.lat, zipcodeLatLng.lng]);
        } else {
          const {
            alert,
          } = this.props;
          alert.show('Invalid zip code');
          this.setState({
            searchLoading: false,
          });
        }
      });
  }

  render() {
    const {
      displayMap,
      zipcodeSearch,
      zipcodeLatLng,
      organizationsWithinDistance,
      distance,
      searchLoading,
    } = this.state;

    return (
      <div className="container">
        <div className="jumbotron-fluid mt-3">
          <h1 className="display-4">Find Organizations Near You</h1>
        </div>
        <form onSubmit={this.onSubmitZipcode}>
          <div className="input-group mb-3">
            <input type="text" className="form-control form-purple" placeholder="Enter your zip code here" value={zipcodeSearch} onChange={this.onHandleChangeZipcode} />
            <div className="input-group-append">
              <button className={`btn btn-primary btn-primary-theme rounded-right ld-ext-right ${searchLoading ? 'running' : ''}`} type="submit">
                Search
                <div className="ld ld-ring ld-spin" />
              </button>
            </div>
          </div>
        </form>

        {displayMap
          ? (
            <div>
              <h5>
                <span className="font-weight-bold">
                  {organizationsWithinDistance.length}
                  {' '}
                </span>
                <span className="font-weight-light">
                  results within
                  {' '}
                  {distance}
                  {' '}
                  km of
                  {' '}
                  {zipcodeSearch}
                </span>
              </h5>
              <div className="row">
                <div className="col" style={{ overflow: 'scroll', height: '50vh' }}>
                  {
                    organizationsWithinDistance.map((org, index) => (
                      <Card key={org.creationDate + org.orgAddress} style={{ width: '100%', cursor: 'pointer' }} className="mb-2 shadow" onClick={() => this.handleOrgCardClick(org, index)}>
                        <Card.Body>
                          <h5>{org.orgName}</h5>
                          <small className="font-weight-bold">{org.orgAddress}</small>
                          <br />
                          <small>
                            Website:
                            <a href={org.orgWebsite} target="_blank" rel="noreferrer" className="text-primary-theme">{org.orgWebsite}</a>
                          </small>
                          <br />
                          <small className="float-left">
                            <span>Call: </span>
                            <span className="text-primary-theme">{org.orgPhoneNumber}</span>
                          </small>
                          <small className="float-right">
                            <span>Email: </span>
                            <span className="text-primary-theme">{org.orgEmail}</span>
                          </small>
                        </Card.Body>
                      </Card>
                    ))
                  }
                </div>
                <div className="col">
                  <MapComponent
                    organizations={organizationsWithinDistance}
                    lat={zipcodeLatLng.lat}
                    lng={zipcodeLatLng.lng}
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${APIKey}&v=3.exp&libraries=geometry,drawing,places`}
                    loadingElement={<div style={{ height: '100%' }} />}
                    containerElement={<div style={{ height: '400px' }} />}
                    mapElement={<div style={{ height: '100%' }} />}
                  />
                </div>
              </div>
            </div>
          )
          : <div />}
      </div>
    );
  }
}

export default withAlert()(FindOrganization);
