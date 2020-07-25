import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import Mapbox from './components/mapbox';
import './App.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <Mapbox/>;
  }
}

export default hot(App);
