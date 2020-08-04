import React from 'react';
import { Divider, Header, Dropdown, Modal, Button, Icon, Responsive } from "semantic-ui-react";
import moment from 'moment';

import DetailsDate from './detailsDate';
import DetailsCompareDates from './detailsCompareDates';
import CountGraph from './countGraph';
import { selectYearOptions, durationModeAdjective } from './utils';
import bike_locations from '../data/bike_locations.json';
import './bikeLocDetails.scss'
import 'semantic-ui-css/semantic.css';

class BikeLocDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    }
  }

  handleGetWidth = () => {
    return { width: window.innerWidth, height: window.innerHeight };
  };

  handleOnUpdate = (e, { width }) => {
    this.setState(width);
  };


  render() {
    const {
      isMobile,
      selectedDate,
      durationMode,
      compareWithDate,
      selectedCountLoc,
      selectedCountLocObj,
      selectedBusiness,
      selectedBusinessObj,
      firstYear,
      lastYear,
      handleBack,
      handleGraphClick,
      handleYearChange,
    } = this.props;
    const { width, height } = this.state;
    const selectedYear = moment(selectedDate).year();
    return (
      <div className='station-details'>
        <div className='top'>
          <div>
            <Button icon onClick={handleBack} title="Back">
              <Icon name='arrow left' />
            </Button>
          </div>
          <div className='heading'>
            <Header as="h3">
              {/* {bike_locations[selectedCountLoc].name } */}
            </Header>
          </div>
        </div>
        <Divider hidden />
        {
          compareWithDate ?
            <DetailsCompareDates isMobile={isMobile} selectedDate={selectedDate} selectedDateObj={selectedCountLocObj[selectedDate]} durationMode={durationMode}
            compareWithDate={compareWithDate} compareWithDateObj={selectedCountLocObj[compareWithDate]} /> :
            <DetailsDate isMobile={isMobile} data={selectedCountLocObj[selectedDate]} selectedDate={selectedDate} durationMode={durationMode} />
        }
        <Divider horizontal>
          <Header size='medium' className='details-graph-header'>
            <div>
              { durationModeAdjective(durationMode) } Counts in&nbsp;
            </div>
            <Dropdown inline options={selectYearOptions(firstYear, lastYear)} value={selectedYear} selectOnNavigation={false} onChange={handleYearChange} />
            <Modal trigger={<div className='icon-container'><Icon name='external' size='small' title='Expand graph' link /></div>} size='fullscreen' closeIcon>
              <Modal.Header>
                { durationModeAdjective(durationMode) } Counts in&nbsp;
                <Dropdown inline options={selectYearOptions(firstYear, lastYear)} value={selectedYear} selectOnNavigation={false} onChange={handleYearChange} />
              </Modal.Header>
              <Responsive as={Modal.Content} getWidth={this.handleGetWidth} onUpdate={this.handleOnUpdate} fireOnMount>
                <CountGraph isMobile={isMobile} complexData={selectedCountLocObj} handleGraphClick={handleGraphClick} selectedYear={selectedYear} width={width} height={height} />
              </Responsive>
            </Modal>
          </Header>
        </Divider>
        <div>
          <CountGraph isMobile={isMobile} durationMode={durationMode} complexData={selectedCountLocObj} handleGraphClick={handleGraphClick} selectedYear={selectedYear} />
        </div>
      </div>
    )
  }
}

export default BikeLocDetails;