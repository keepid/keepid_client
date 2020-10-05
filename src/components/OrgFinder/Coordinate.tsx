import React, { Component } from 'react';

interface Props {
    lat: any,
    lng: any,
}

interface State {

}

class Coordinate extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  get lat() {
    return this.lat;
  }

  get lng() {
    return this.lng;
  }

  set lat(input: number) {
    this.lat = input;
  }

  set lng(input: number) {
    this.lng = input;
  }
}

export default Coordinate;
