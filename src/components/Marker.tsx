import React, { Component } from 'react';

interface Props {
  lat: number,
  lng: number,
  orgName: string,
  address: string,
  phone: string,
  email: string,
}

class Marker extends Component<Props, {}> {
  render() {
    return (<strong>{this.props.orgName}</strong>);
  }
}

export default Marker;
