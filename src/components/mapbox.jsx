import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Responsive } from 'semantic-ui-react';
import { debounce, first } from 'lodash';
import moment from 'moment';

import bike_locations from '../data/bike_locations.json';
import day_list from '../data/days.json';
import week_list from '../data/weeks.json';

const coords = [-122.3321, 47.6062]
const dates = day_list;
const weeks = week_list;
const firstDate = dates[0];
const lastDate = dates[dates.length - 1];
const firstYear = moment(firstDate).year();
const lastYear = moment(lastDate).year();

class Mapbox extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        selectedDate: lastDate,
        selectedDateObj: null,
        selectedBusiness: null,
        selectedBusinessData: null,
        selectedBusinessObj: null,
        selectedCountLoc: null,
        selectedCountLocData: null,
        selectedCountLocObj: null,
        durationMode: 'days',
        mode: 'entries',
        compareWithAnotherDate: false,
        compareWithDate: moment(lastDate).subtract(52, 'week').format('YYYY-MM-DD'),
        compareWithDateObj: null,
        isDataBoxVisible: true,
        isDataLoaded: false,
      }
    }
  
    componentDidMount() {
      this.map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coords,
        bearing: 29,
        minZoom: 9,
        zoom: 13,
        hash: false,
        maxPitch: 0,
      });
  
      this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
  
      this.map.on('load', () => {
        this.refreshMap();
      });
    }

    getLocData(dateObj, compareWithAnotherDate, compareDateObj, fieldName, complexId) {
      if (!compareWithAnotherDate) {
        return dateObj[complexId][fieldName];
      }
      if (!dateObj[complexId] || !compareDateObj[complexId]) {
        return 0;
      }
      return ((dateObj[complexId][fieldName] - compareDateObj[complexId][fieldName]) / compareDateObj[complexId][fieldName]) * 100
    }

  
    refreshMap() {
      const { selectedDate, compareWithDate, compareWithAnotherDate, durationMode } = this.state;
  
      import(`../data/${durationMode}/${selectedDate}.json`)
        .then(data => {
          if (compareWithAnotherDate) {
            import(`../data/${durationMode}/${compareWithDate}.json`)
              .then(compareWithData => {
                 this.setState({ selectedDateObj: data, compareWithDateObj: compareWithData, isDataLoaded: true}, this.updateMap);
              });
          } else {
            this.setState({ selectedDateObj: data, compareWithDateObj: null, isDataLoaded: true}, this.updateMap);
          }
        });
    }

    selectCountLocation() {
      const { selectedCountLoc, durationMode } = this.state;
      import(`../data/complexId/${selectedCountLoc}.json`)
        .then(data => {
          this.setState({ selectedCountLocData: data, selectedCountLocObj: data[durationMode], isDataLoaded: true}, this.goToLoc);
        });
    }

    goToLoc() {
      const { selectedCountLoc } = this.state;
      this.map.easeTo({
        center: bike_locations[selectedCountLoc].coordinates,
        bearing: 29,
      });
    }

    updateMap() {
      const {
        selectedDateObj,
        compareWithAnotherDate,
        compareWithDateObj,
        durationMode,
        mode,
      } = this.state;
      const chosenLocations = Object.keys(bike_locations).filter((l) => selectedDateObj[l]);
      const visibleSystems = ['-'];
  
      const geoJson = {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": chosenLocations.map((l) => {
              return {
                "type": "Feature",
                "properties": {
                  "id": l,
                  "count": this.getLocData(selectedDateObj, compareWithAnotherDate, compareWithDateObj, "count", l),
                },
                "geometry": {
                  "type": "Point",
                  "coordinates": bike_locations[l].coordinates,
                }
              }
            })
          }
      };
  
      // Object.keys(systems).forEach((s) => {
      //   if (systems[s]) {
      //     visibleSystems.push(s.toUpperCase());
      //   }
      // });
  
      if (this.map.getSource('data')) {
        this.map.getSource('data').setData(geoJson.data);
      } else {
        this.map.addSource('data', geoJson);
      }
  
      let displayFactor = 1;
  
      if (durationMode === 'weeks') {
        displayFactor = 7;
      } else if (durationMode === 'months') {
        displayFactor = 30
      }
  
      let circleRadiusValue = [
        'interpolate', ['linear'], ['zoom'],
        10, ['max', ['min', ['/', ['get', mode], 5000 * displayFactor], 5], 3],
        14, ['max', ['min', ['/', ['get', mode], 2000 * displayFactor], 50], 5]
      ];
  
      if (compareWithAnotherDate) {
        circleRadiusValue = [
          'interpolate', ['linear'], ['zoom'],
          10, ['max', ['min', ['abs', ['/', ['get', mode], 10]], 20], 3],
          14, ['max', ['min', ['abs', ['/', ['get', mode], 5]], 50], 5]
        ];
      }
  
      let circleColorValue = '#54c8ff';
  
      if (compareWithAnotherDate) {
        circleColorValue = [
          'case', ['>=', ['get', mode], 0], '#21ba45', '#db2828'
        ];
      }
  
      // const circleOpacityValue = [
      //   'match', ['get', 'system'], visibleSystems, 0.5, 0
      // ]
  
      if (this.map.getLayer('data')) {
        this.map.setPaintProperty('data', 'circle-radius', circleRadiusValue);
        // this.map.setPaintProperty('data', 'circle-opacity', circleOpacityValue);
        this.map.setPaintProperty('data', 'circle-color', circleColorValue);
      } else {
        this.map.addLayer({
          'id': 'data',
          'type': 'circle',
          'source': 'data',
          'paint': {
            'circle-radius': circleRadiusValue,
            'circle-color': circleColorValue,
            // 'circle-opacity': circleOpacityValue
          },
        });
      }
  
      this.map.on('click', 'data', e => {
        this.debounceSelectCountLocation(e.features[0].properties.id);
      });
      this.map.on('mouseenter', 'data', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'data', () => {
        this.map.getCanvas().style.cursor = '';
      });
    }
  
    debounceSelectCountLocation = debounce((location) => {
      this.setState({ selectedCountLoc: location, isDataBoxVisible: true }, this.selectCountLocation);
    }, 300, {
      'leading': true,
      'trailing': false
    });
  
    handleModeClick = (e, { name }) => this.setState({ mode: name }, this.refreshMap);
  
    handleDurationModeClick = (e, { name }) => {
      const { selectedDate, compareWithDate, selectedCountLocData } = this.state;
      let newDate = selectedDate;
      let newCompareWithDate = compareWithDate;
  
      if (name === 'weeks') {
        newDate = moment(selectedDate).endOf('week').subtract(1, 'day').format('YYYY-MM-DD');
        newCompareWithDate = moment(compareWithDate).endOf('week').subtract(1, 'day').format('YYYY-MM-DD');
      } else if (name === 'months') {
        newDate = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
        newCompareWithDate = moment(compareWithDate).startOf('month').format('YYYY-MM-DD');
      }
      this.setState({ durationMode: name, selectedDate: newDate, compareWithDate: newCompareWithDate, selectedCountLocObj: selectedCountLocData && selectedCountLocData[name] }, this.refreshMap);
    }
  
    handleDateInputChange = (date) => {
      const dateObj = moment(date);
      this.selectDate(dateObj.format('YYYY-MM-DD'));
    }
  
    handleCompareDateInputChange = (date) => {
      const dateObj = moment(date);
      this.setState({compareWithDate: dateObj.format('YYYY-MM-DD')}, this.refreshMap);
    }
  
    handleYearChange = (e, { value }) => {
      const { selectedDate, durationMode } = this.state;
      const lastDateObj = moment(lastDate);
      let newDate = moment(selectedDate).year(value);
  
      if (newDate > lastDateObj) {
        newDate = lastDateObj
      }
  
      if (durationMode === 'weeks') {
        newDate.endOf('week').subtract(1, 'day');
      } else if (durationMode === 'months') {
        newDate.startOf('month');
      }
  
      this.selectDate(newDate.format('YYYY-MM-DD'));
    }
  
    handleOnUpdate = (e, { width }) => {
      this.setState({ 'isMobile': width < Responsive.onlyTablet.minWidth });
    };
  
    handleToggle = (event, {name, value}) => {
      if (this.state.hasOwnProperty(name)) {
        const prevVal = this.state[name];
        this.setState({ [name]: !prevVal }, this.refreshMap);
      }
    }
  
    handleBack = () => {
      this.setState({ selectedCountLoc: null });
    }
  
    handleSelectCountLoc = (location) => {
      const { selectedCountLoc } = this.state;
      if (selectedCountLoc !== location) {
        this.setState({ selectedCountLoc: location }, this.selectCountLocation);
      }
    }

    handleSelectBusinessLoc = (location) => {
        const { selectedBusiness } = this.state;
        if (selectedBusiness!== location) {
          this.setState({ selectedBusiness: location }, this.selectBusiness);
        }
      }
  
    handleToggleDataBox = () => {
      this.setState({ isDataBoxVisible: !this.state.isDataBoxVisible });
    }
  
    handleGraphClick = (date) => {
      this.selectDate(date);
    }
  
    selectDate = (date) => {
      const { durationMode } = this.state;
      const newDate = moment(date);
  
      if (!newDate.isValid()) {
        return;
      }
  
      const newState = { selectedDate: moment(date).format('YYYY-MM-DD') };
      const nextYearToday = newDate.clone().add(52, 'week');
  
      if (newDate.year() !== firstYear) {
        if (durationMode === 'months') {
          newState['compareWithDate'] = newDate.subtract(1, 'year').format('YYYY-MM-DD');
        } else {
          newState['compareWithDate'] = newDate.subtract(52, 'week').format('YYYY-MM-DD');
        }
      } else if (nextYearToday <= moment(lastDate)) {
        if (durationMode === 'months') {
          newState['compareWithDate'] = newDate.add(1, 'year').format('YYYY-MM-DD');
        } else {
          newState['compareWithDate'] = newDate.add(52, 'week').format('YYYY-MM-DD');
        }
      } else {
        if (durationMode === 'months') {
          newState['compareWithDate'] = newDate.add(1, 'month').format('YYYY-MM-DD');
        } else if (durationMode === 'weeks') {
          newState['compareWithDate'] = newDate.add(1, 'week').format('YYYY-MM-DD');
        } else {
          newState['compareWithDate'] = newDate.add(1, 'day').format('YYYY-MM-DD');
        }
      }
      this.setState(newState, this.refreshMap);
    }
  
    render() {
      const {
        isMobile,
        isDataBoxVisible,
        isDataLoaded,
        selectedDate,
        selectedDateObj,
        selectedCountLoc,
        selectedCountLocObj,
        selectedBusiness,
        selectedBusinessObj,
        durationMode,
        mode,
      } = this.state;
      return (
        <Responsive as='div' fireOnMount onUpdate={this.handleOnUpdate}>
          <div ref={el => this.mapContainer = el} className='mapbox'>
          </div>
        </Responsive>
      )
    }
}

export default Mapbox;