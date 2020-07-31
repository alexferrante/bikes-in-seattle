import React from 'react';
import { Statistic, Divider, Header } from "semantic-ui-react";
import { durationModeDate } from './utils';

class DetailsCompareDates extends React.Component {
  render() {
    const { isMobile, selectedDate, compareWithDate, selectedDateObj, compareWithDateObj, durationMode } = this.props;
    const compareWithCount = compareWithDateObj ? compareWithDateObj.count : 0;
    const selectedCount = selectedDateObj ? selectedDateObj.count : 0;
    const countDiff = (selectedCount - compareWithCount) / compareWithCount * 100;
    return (
      <div>
        <Divider horizontal>
          <Header size='medium'>Count</Header>
        </Divider>
        <Statistic.Group widths={isMobile ? 2 : 3} size='mini'>
          <Statistic>
            <Statistic.Value>{ compareWithCount.toLocaleString('en-US') }</Statistic.Value>
            <Statistic.Label>{ durationModeDate(compareWithDate, durationMode, 'small') }</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{ selectedCount.toLocaleString('en-US') }</Statistic.Value>
            <Statistic.Label>{ durationModeDate(selectedDate, durationMode, 'small') }</Statistic.Label>
          </Statistic>
          <Statistic color={countDiff >= 0 ? "green" : "red" }>
            <Statistic.Value>{ countDiff >= 0 && '+'}{ Math.round(countDiff * 100) / 100}%</Statistic.Value>
            <Statistic.Label>Change</Statistic.Label>
          </Statistic>
        </Statistic.Group>
      </div>
    )
  }
}

export default DetailsCompareDates;