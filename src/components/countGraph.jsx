import React from 'react';
import './styles.scss';
import Graph from './graph';
import 'semantic-ui-css/semantic.css';

class CountGraph extends React.Component {
  graphData() {
    const { complexData, selectedYear } = this.props;

    const keys = Object.keys(complexData).filter((date) => date.startsWith(selectedYear)).sort();

    return ["count"].map((field) => {
      return {
        'id': field,
        'data': keys.map((key) => {
                  const data = complexData[key];
                  return {
                    "x": key,
                    "y":  data[field]
                  }
                })
      };
    })
  }

  render() {
    const { isMobile, handleGraphClick, width, height, durationMode } = this.props;
    return (
      <Graph isMobile={isMobile} durationMode={durationMode} handleGraphClick={handleGraphClick} data={this.graphData()} width={width} height={height} />
    )
  }
}

export default CountGraph;