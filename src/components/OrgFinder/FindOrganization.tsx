import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import MapComponent from './MapComponent';
import FindOrgIcon from '../../static/images/FindOrgIcon.svg';
import InvalidZipcodeIcon from '../../static/images/InvalidZipcodeIcon.svg';
import Coordinate from './Coordinate';
import getServerURL from '../../serverOverride';
import OrganizationSignup from '../SignUp/OrganizationSignup';

interface Props {
  alert: any,
}

interface State {
  organizations: any,
  displayMap: boolean,
  displayError: boolean,
  displayIcon: boolean,
  zipcodeSearch: string,
  zipcodeLat: any,
  zipcodeLng: any,
  zipcodeLatLang: any,
  results: any,
  orgsWithinRadius: any,
  count: number,
}

const APIKey = 'AIzaSyBS1seMnrtdwOxpcoezbN_QVwVp797Dxyw';

class FindOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizations: [],
      displayMap: false,
      displayError: false,
      displayIcon: true,
      zipcodeSearch: '',
      zipcodeLat: {},
      zipcodeLng: {},
      zipcodeLatLang: {},
      results: [],
      orgsWithinRadius: [],
      count: 0,
    };
    this.getAllOrganizations = this.getAllOrganizations.bind(this);
    this.onHandleChangeZipcode = this.onHandleChangeZipcode.bind(this);
    this.onSubmitZipcode = this.onSubmitZipcode.bind(this);
  }

  componentDidMount() {
    this.getAllOrganizations();
  }

  getAllOrganizations() {
    fetch(`${getServerURL()}/get-all-orgs `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        userTypes : [],
        organizations : []
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          organizations,
        } = JSON.parse(responseJSON);
        this.setState({
          organizations,
        });
      });
      console.log("got orgs!");
    // const count = 0;
    // const organizations = [
    //   {
    //     orgName: 'Broad Street Ministries',
    //     lat: 39.9460872,
    //     lng: -75.1644793,
    //     address: '315 S Broad St, Philadelphia, PA 19107',
    //     zipcode: 19107,
    //     phone: '',
    //     email: '',
    //     count,
    //   },
    // ];
    // return organizations;
    // this.setState({ organizations });
  }

  onHandleChangeZipcode(event: any) {
    this.setState({ zipcodeSearch: event.target.value });
  }

  onSubmitZipcode(event: any) {
    event.preventDefault();
    this.calculateOrganizationsWithinDistance(event.target.value);
  }

  calculateOrganizationsWithinDistance(zipcode: number) {
    const {
      orgsWithinRadius,
    } = this.state;
    var {
      count,
    } = this.state;
    const searchCoordinate = this.getCoordinateFromZipcode(zipcode);
    const allOrgs = this.getAllOrganizations;
    for (var i = 0; i < allOrgs.length; i++) {
      const orgCoordinate = this.getCoordinateFromZipcode(allOrgs[i].zipcode);
      const distBetween = this.getDistanceInKM(orgCoordinate, searchCoordinate);
      if (distBetween <= 10) {
        orgsWithinRadius.push(allOrgs[i]);
        count++;
      }
    }
    return orgsWithinRadius;
    // this.setState(orgsWithinRadius);
  }

  getCoordinateFromZipcode(zipcode: number): Coordinate {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json?'); 
    const search = `postal_code:${zipcode}`;
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

        // if valid zipcode
        if (status === 'SUCCESS') {
          const zipcodeLat = responseJSON.results[0].geometry.location.lat;
          const zipcodeLng = responseJSON.results[0].geometry.location.lng;
          const coordinateProps = {
            lat: zipcodeLat,
            lng: zipcodeLng,
          }
          const coordinate = new Coordinate(coordinateProps);
          return coordinate;
        } else {
          this.setState({
            displayMap: false,
            displayError: true,
            displayIcon: false,
          });
        }
      });
    const coordinateProps = {
      lat: null,
      lng: null,
    }
    const coordinate = new Coordinate(coordinateProps);
    return coordinate;
  }

  // haversine formula
  getDistanceInKM(coordinate1: Coordinate, coordinate2: Coordinate): number {
    let lat1 = coordinate1.lat;
    let lat2 = coordinate2.lat;
    let lng1 = coordinate1.lng;
    let lng2 = coordinate2.lng;
    const avgEarthRadiusInKM = 6371;
    var radLat = this.degToRad(lat2-lat1);
    var radLng = this.degToRad(lng2-lng1);
    var a = 
      Math.sin(radLat/2) * Math.sin(radLat/2) + 
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(radLng/2) * Math.sin(radLng/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distInKM = avgEarthRadiusInKM * c;
    return distInKM;
  }

  // helper function to convert degree to radian
  degToRad(degree: number ): number {
    return degree * (Math.PI/180);
  }

  renderOrganizations() {
    const orgCards : React.ReactFragment[] = this.state.orgsWithinRadius.map((organization, i) => (
      <div className="row mx-md-n5">
        <div className="shadow p-3 mb-5 ml-5 bg-white rounded">
          <div className="col px-md-2">
            <h6 className="font-weight-bold">{organization.orgName}</h6>
          </div>
          <div className="col px-md-2"><b>{organization.address}</b></div>
            <div className="row px-md-4">
            <div className="text-green mr-1">
              Open
            </div>
              • Closes 4:00PM
            </div>
            <div className="row px-md-4 pb-4">
              Website:
                <a href={organization.website} className="text-primary-theme ml-1">
                  {organization.website}
                </a>
            </div>
            <div className="row px-md-4">
              Call:
                <div className="text-primary-theme ml-1 mr-5">{organization.phone}</div>
                  <div className="ml-5 mr-1">Email:</div>
                <div className="text-primary-theme">{organization.email}</div>
            </div>
          </div>
        {/* { showClientAuthModal ? this.render() : null } */}
      </div>));
      return orgCards;
  }

  render() {
    const {
      displayMap,
      displayError,
      displayIcon,
      zipcodeSearch,
      organizations,
      zipcodeLat,
      zipcodeLng,
      count,
    } = this.state;

    return (
      <div className="container">

        <div className="jumbotron-fluid mt-5">
          <h1 className="text-center"><b>Find Organizations Near You</b></h1>
        </div>
        <form onSubmit={this.onSubmitZipcode}>
          <div className="input-group w-50 mb-3 mt-5 mx-auto">
            <input
              type="text"
              className="form-control form-purple"
              placeholder="Search by zipcode..."
              value={zipcodeSearch}
              onChange={this.onHandleChangeZipcode}
            />
            <div className="input-group-append">
              <button className="btn btn-info btn-primary-theme" type="submit">Search</button>
            </div>
          </div>
        </form>

        {displayIcon
          ? (
            <div className="text-center mb-3 mt-5">
              <img src={FindOrgIcon} className="img-fluid" alt="Girl with Magnifying Glass" />
            </div>
          )
          : <div />}

        {displayMap
          ? (
            <div className="row">
              <div className="col-sm-6">
                <div className="row">
                  <h5 className="pb-3 mr-1 ml-3">{count}</h5>
                  <h5 className="pb-3">results near {zipcodeSearch}</h5>
                </div>

                {/* <div className="row mx-md-n5">
                  <div className="shadow p-3 mb-5 ml-5 bg-white rounded">
                    <div className="col px-md-2">
                      <h6 className="font-weight-bold">Broad Street Ministry</h6>
                    </div>
                    <div className="col px-md-2"><b>315 S Broad St, Philadelphia, PA 19107</b></div>
                    <div className="row px-md-4">
                      <div className="text-green mr-1">
                        Open
                      </div>
                      • Closes 4:00PM
                    </div>
                    <div className="row px-md-4 pb-4">
                      Website:
                      <a href="broadstreetministry.org" className="text-primary-theme ml-1">
                        broadstreetministry.org
                      </a>
                    </div>
                    <div className="row px-md-4">
                      Call:
                      <div className="text-primary-theme ml-1 mr-5">(215) 735-4847</div>
                      <div className="ml-5 mr-1">Email:</div>
                      <div className="text-primary-theme">broadstreetministry@gmail.com</div>
                    </div>
                  </div>
                </div>

                <div className="row mx-md-n5">
                  <div className="shadow p-3 mb-5 ml-5 bg-white rounded">
                    <div className="col px-md-2">
                      <h6 className="font-weight-bold">Project Home</h6>
                    </div>
                    <div className="col px-md-2"><b>1515 Fairmont Ave, Philadelphia, PA 19130</b></div>
                    <div className="row px-md-4">
                      <div className="text-green mr-1">
                        Open
                      </div>
                      • Closes 4:00PM
                    </div>
                    <div className="row px-md-4 pb-4">
                      Website:
                      <a href="projecthome.org" className="text-primary-theme ml-1">
                        projecthome.org
                      </a>
                    </div>
                    <div className="row px-md-4">
                      Call:
                      <div className="text-primary-theme ml-1 mr-5">(215) 232-7272</div>
                      <div className="ml-5 mr-1">Email:</div>
                      <div className="text-primary-theme mr-5">projecthome@gmail.com</div>
                    </div>
                  </div>
                </div>

                <div className="row mx-md-n5">
                  <div className="shadow p-3 mb-5 ml-5 bg-white rounded">
                    <div className="col px-md-2">
                      <h6 className="font-weight-bold">Bethesda Project</h6>
                    </div>
                    <div className="col px-md-2"><b>1630 South Street, Philadelphia, PA 19146</b></div>
                    <div className="row px-md-4">
                      <div className="text-red mr-1">
                        Closed
                      </div>
                      • Opens 9:00AM Monday
                    </div>
                    <div className="row px-md-4 pb-4">
                      Website:
                      <a href="bethesdaproject.org" className="text-primary-theme ml-1">
                        bethesdaproject.org
                      </a>
                    </div>
                    <div className="row px-md-4">
                      Call:
                      <div className="text-primary-theme ml-1 mr-5">(215) 985-1600</div>
                      <div className="ml-5 mr-1">Email:</div>
                      <div className="text-primary-theme mr-5">info@bethesdaproject.org</div>
                    </div>
                  </div>
                </div> */}
              </div> 

              <div className="col mt-5">
                {displayMap
                  ? (
                    <MapComponent
                      organizations={this.state.orgsWithinRadius}
                      lat={zipcodeLat}
                      lng={zipcodeLng}
                      googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${APIKey}&v=3.exp&libraries=geometry,drawing,places`}
                      loadingElement={<div style={{ width: '100%', height: '100%' }} />}
                      containerElement={<div style={{ height: '400px' }} />}
                      mapElement={<div style={{ width: '100%', height: '100%' }} />}
                    />
                  )
                  : <div />}
              </div>
            </div>
          )
        : <div />}

        {displayError
          ? (
            <div className="text-center">
              <p className="text-red">No results found. Make sure you are searching for a valid zipcode.</p>
              <br />
              <img src={InvalidZipcodeIcon} className="img-fluid" alt="Guy looking into void" />
            </div>
          )
        : <div />}
          {/* {count === 0 ? <h3>No Organizations Found</h3> : this.renderOrganizations()} */}
      </div>
    );
  }
}

export default withAlert()(FindOrganization);
