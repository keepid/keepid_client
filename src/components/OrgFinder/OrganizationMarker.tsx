import React, { Component } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

interface Props {
  lat: number,
  lng: number,
  orgName: string,
  address: string,
  phone: string,
  email: string,
}

interface State {
  open: boolean,
}

class OrganizationMarker extends Component<Props, State> {
  constructor(props: Props) {
      super(props);
      this.state = {
        open: false,
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
  </div>
</InfoWindow>
              )}
        </Marker>
      </div>
    );
  }
}

export default OrganizationMarker;
