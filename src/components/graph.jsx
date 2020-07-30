import React from 'react';
import { Line } from '@nivo/line';

class Graph extends React.Component {
  handleClick = (point, event) => {
    const { handleGraphClick } = this.props;
    handleGraphClick(point.data.xFormatted);
  }

  width() {
    const { isMobile, width } = this.props;
    if (width) {
      return width - (isMobile ? 70 : 200);
    }
    return isMobile ? 270 : 440;
  }

  height() {
    const { height } = this.props;
    if (height) {
      return height - 200;
    }

    return 400;
  }

  render() {
    const { isMobile, data, durationMode } = this.props;
    const theme = {
      axis: {
        ticks: {
          line: {
            stroke: "black"
          },
          text: {
            fill: "#333"
          }
        },
      },
      tooltip: {
        container: {
          background: '#ccc',
          color: '#333'
        }
      },
      legends: {
        text: {
          fill: '#333'
        }
      }
    };
    const format = (number) => {
      return number.toLocaleString('en-US');
    }

    return (
      <Line
        width={this.width()}
        height={this.height()}
        margin={{
          top: 0,
          right: 0,
          bottom: 100,
          left: isMobile ? 0 : 70
        }}
        data={data}
        enableArea={false}
        colors={{'scheme': 'set2'}}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: false,
          precision: durationMode === 'months' ? 'month' : 'day',
        }}
        xFormat={ durationMode === 'months' ? "time:%Y-%m" : "time:%Y-%m-%d" }
        yFormat={format}
        enablePoints={false}
        enableGridY={true}
        enableGridX={false}
        isInteractive={true}
        useMesh={true}
        enableSlices={false}
        axisBottom={{
          format: durationMode === 'months' ? "%b %Y" : "%Y-%m-%d",
          tickValues: 'every month',
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -50,
        }}
        axisLeft={ isMobile ? null : {
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          format: format,
        }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 100,
            itemsSpacing: 50,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            itemTextColor: "#000000",
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                  on: "hover",
                  style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1
                  }
              }
            ]
          }
        ]}
        theme={theme}
        onClick={this.handleClick}
      />
    )
  }
}

export default Graph;