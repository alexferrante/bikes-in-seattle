import React from 'react';
import { Segment, Header, Dimmer, Loader } from "semantic-ui-react";

// import OverallDetails from './overallDetails';
import BikeLocDetails from './bikeLocDetails';

class DataBox extends React.Component {
  componentDidUpdate(prevProps) {
    const { selectedStation } = this.props;
    if (prevProps.selectedStation !== selectedStation) {
      this.dataBox.scrollTop = 0;
    }
  }

  render() {
    const {
      isMobile,
      isDataLoaded,
      handleToggle,
      handleSelectCountLoc,
      handleSelectBusinessLoc,
      durationMode,
      mode,
      selectedCountLoc,
      selectedCountLocObj,
      selectedBusiness,
      selectedBusinessObj,
      selectedDate,
      selectedDateObj,
      compareWithDate,
      compareWithDateObj,
      firstYear,
      lastYear,
      handleBack,
      handleGraphClick,
      handleYearChange,
    } = this.props;
    return (
      <Segment inverted vertical className="databox">
        {
          !isDataLoaded &&
          <Dimmer active>
            <Loader inverted></Loader>
          </Dimmer>
        }
        <div className='inner-databox' ref={el => this.dataBox = el}>
          <Segment>
                <BikeLocDetails isMobile={isMobile}
                  selectedCountLoc={selectedCountLoc} selectedCountLocObj={selectedCountLocObj}
                  selectedBusiness={selectedBusiness} selectedBusinessObj={selectedBusinessObj}
                  selectedDate={selectedDate} durationMode={durationMode}
                  compareWithDate={compareWithDate}
                  firstYear={firstYear} lastYear={lastYear}
                  handleYearChange={handleYearChange} handleBack={handleBack}
                  handleGraphClick={handleGraphClick} /> 

          </Segment>
        </div>
      </Segment>
    )
  }
}

export default DataBox;