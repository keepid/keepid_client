import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import MapComponent from './MapComponent';
import FindOrgIcon from '../../static/images/FindOrgIcon.svg';

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
          <h1 className="text-center"><b>Find Organizations Near You</b></h1>
        </div>
        <form onSubmit={this.onSubmitZipcode}>
          <div className="input-group w-50 mb-3 mt-5 mx-auto">
            <input type="text" className="form-control form-purple" placeholder="Search by zipcode..." value={zipcodeSearch} onChange={this.onHandleChangeZipcode} />
            <div className="input-group-append">
              <button className="btn btn-info btn-primary-theme" type="submit">Search</button>
            </div>
          </div>
        </form>
        <div className="text-center mb-3 mt-5">
          <img src={FindOrgIcon} className="img-fluid" alt="Responsive image" />
        </div>
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
