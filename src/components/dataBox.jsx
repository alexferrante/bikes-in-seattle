import React from 'react';
import { Segment, Header, Dimmer, Loader } from "semantic-ui-react";
// import OverallDetails from './overallDetails';
import BikeLocDetails from './bikeLocDetails';
import style from './dataBox.css'

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
      <Segment inverted vertical className={style["databox"]}>
        {
          !isDataLoaded &&
          <Dimmer active>
            <Loader inverted></Loader>
          </Dimmer>
        }
        <div className={style['inner-databox']} ref={el => this.dataBox = el}>
          <Segment>
            { selectedCountLoc && selectedCountLocObj ?
              <BikeLocDetails isMobile={isMobile}
                selectedDate={selectedDate} durationMode={durationMode}
                compareWithDate={compareWithDate}
                selectedCountLoc={selectedCountLoc} selectedCountLocObj={selectedCountLocObj}
                selectedBusiness={selectedBusiness} selectedBusinessObj={selectedBusinessObj}
                firstYear={firstYear} lastYear={lastYear}
                handleBack={handleBack}
                handleGraphClick={handleGraphClick} handleYearChange={handleYearChange}/> :
                <div></div>
            }
          </Segment>
        </div>
      </Segment>
    )
  }
}

export default DataBox;