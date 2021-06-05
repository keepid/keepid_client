import React, { Component } from 'react';
import { InfoWindow, Marker } from 'react-google-maps';

interface Props {
  lat: number,
  lng: number,
  orgName: string,
  address: string,
  phone: string,
  email: string,
  website: string,
  showInfo: boolean,
}

interface State {
  open: boolean,
}

class OrganizationMarker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: props.showInfo,
    };
    this.handleOpenInfoWindow = this.handleOpenInfoWindow.bind(this);
  }

  handleOpenInfoWindow() {
    const { open } = this.state;
    this.setState({
      open: !open,
    });
  }

  render() {
    const {
      orgName,
      lat,
      lng,
      address,
      phone,
      email,
      website,
    } = this.props;

    const {
      open,
    } = this.state;

    return (
      <div>
        <Marker
          position={{ lat, lng }}
          onClick={this.handleOpenInfoWindow}
        >
          {open
              && (
              <InfoWindow
                onCloseClick={this.handleOpenInfoWindow}
                position={{ lat, lng }}
              >
                <div>
                  <p className="font-weight-bold">{orgName}</p>
                  <p>{address}</p>
                  <p>{phone}</p>
                  <p>{email}</p>
                  <p>{website}</p>
                </div>
              </InfoWindow>
              )}
        </Marker>
      </div>
    );
  }
}

export default OrganizationMarker;
