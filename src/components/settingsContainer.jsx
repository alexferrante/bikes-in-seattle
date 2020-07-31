import React from 'react';
import { Grid, Segment, Header, Form, Menu, Checkbox, Divider, Button, Icon } from "semantic-ui-react";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import './styles.scss';

import "react-datepicker/dist/react-datepicker.css";

const significantDates = [
  '2020-03-12', 
  '2020-03-16', 
]

class SettingsContainer extends React.Component {
  filterFridays(date) {
    const { weeks } = this.props;

    return weeks.includes(moment(date).format('YYYY-MM-DD'));
  }

  filterSelectedDate(date) {
    const { selectedDate } = this.props;

    return selectedDate !== moment(date).format('YYYY-MM-DD');
  }

  filterFridaysAndSelectedDate(date) {
    const { selectedDate, weeks } = this.props;

    return weeks.includes(moment(date).format('YYYY-MM-DD')) && selectedDate !== moment(date).format('YYYY-MM-DD');
  }

  renderInput(name, className, onChange, isCompareWithDate, disabled) {
    const { durationMode, firstDate, lastDate, selectedDate, compareWithDate } = this.props;
    const outerClassName = disabled ? 'disabled ui mini icon input' : 'ui mini icon input';
    const dateValue = isCompareWithDate ? compareWithDate : selectedDate;
    const highlightDates = significantDates.map((d) => moment(d).toDate());

    if (durationMode === 'days') {
      return (
        <div className={outerClassName}>
          <DatePicker
            className={className}
            name={name}
            dateFormat='yyyy-MM-dd'
            filterDate={isCompareWithDate && this.filterSelectedDate.bind(this)}
            minDate={moment(firstDate).toDate()}
            maxDate={moment(lastDate).toDate()}
            selected={moment(dateValue).toDate()}
            onChange={onChange}
            disabled={disabled}
            showMonthDropdown showYearDropdown
            highlightDates={highlightDates}
          />
        </div>
      )
    } else if (durationMode === 'weeks') {
      return (
        <div className={outerClassName}>
          <DatePicker
            className={className}
            name={name}
            dateFormat='yyyy-MM-dd'
            filterDate={isCompareWithDate ? this.filterFridaysAndSelectedDate.bind(this) : this.filterFridays.bind(this)}
            minDate={moment(firstDate).toDate()}
            maxDate={moment(lastDate).toDate()}
            selected={moment(dateValue).toDate()}
            onChange={onChange}
            disabled={disabled}
            showMonthDropdown showYearDropdown
            highlightDates={highlightDates}
          />
        </div>
      )
    } else {
      const displayDate = moment(dateValue);
      return (
        <div className={outerClassName}>
          <DatePicker
            className={className}
            startMode='year'
            name={name}
            filterDate={isCompareWithDate && this.filterSelectedDate.bind(this)}
            dateFormat='yyyy-MM'
            minDate={moment(firstDate).toDate()}
            maxDate={moment(lastDate).toDate()}
            selected={displayDate.toDate()}
            onChange={onChange}
            disabled={disabled}
            showMonthYearPicker
          />
        </div>
      )
    }
  }

  render() {
    const { durationMode, mode, isMobile, handleModeClick, handleDurationModeClick, compareWithAnotherDate,
      handleToggle, handleDateInputChange, handleToggleDataBox, handleCompareDateInputChange } = this.props;
    return (
      <Segment inverted vertical className="configbox">
        <div>
          <Header inverted as={isMobile ? 'h3' : 'h1'} color='blue'>  
          </Header>
        </div>
        <Divider horizontal hidden />
        <Form inverted>
          <Menu inverted fluid widths={2} size='mini'>
            <Menu.Item name="count" active={mode === "count"} onClick={handleModeClick} />
          </Menu>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                {
                  this.renderInput('selectedDate', 'date-input', handleDateInputChange, false, false)
                }
              </Grid.Column>
              <Grid.Column style={{ paddingLeft: 0 }}>
                <Menu inverted fluid widths={3} size='mini'>
                  <Menu.Item name='days' content='Daily' active={durationMode === 'days'} onClick={handleDurationModeClick} />
                  <Menu.Item name='weeks' content='Weekly' active={durationMode === 'weeks'} onClick={handleDurationModeClick} />
                  <Menu.Item name='months' content='Monthly' active={durationMode === 'months'} onClick={handleDurationModeClick} />
                </Menu>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ padding: 0 }}>
              <Grid.Column style={{ lineHeight: '30px'}}>
                <Checkbox label={isMobile ? 'Compare' : 'Compare with'} name='compareWithAnotherDate' checked={compareWithAnotherDate} onChange={handleToggle} />
              </Grid.Column>
              <Grid.Column style={{ paddingLeft: 0 }}>
                {
                  this.renderInput('compareWithDate', 'date-input compare-date-input', handleCompareDateInputChange, true, !compareWithAnotherDate)
                }
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>
        { isMobile &&
          <Button icon
            className="mobile-data-box-control" onClick={handleToggleDataBox}
            title="Expand/Collapse">
            <Icon name='sort'/>
          </Button>
        }
      </Segment>
    )
  }
}

export default SettingsContainer;