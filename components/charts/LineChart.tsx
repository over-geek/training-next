import React, { Component } from 'react'
import Chart from 'react-apexcharts'
import type { TrainingMetrics } from '@/services/trainings/types'

interface LineChartProps {
  data: TrainingMetrics;
  title: string;
}

interface LineChartState {
  options: any;
  series: any[];
}

class LineChart extends Component<LineChartProps, LineChartState> {
  constructor(props: LineChartProps) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: 'basic-bar',
          toolbar: {
            show: false
          }
        },
        grid: {
          show: false
        },
        dataLabels: {
          enabled: false
        },
        fill: {
          type: 'gradient',
          gradient: {
            shapeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0.2,
            stops: [0, 90, 100]
          },
        },
        stroke: {
          curve: 'smooth',
          width: 1
        },
        tooltip: {
          x: {
            show: true
          }
        },
        title: {
          text: this.props.title,
        },
        xaxis: {
          categories: this.props.data.attendeeDates,
          labels: {
            show: false
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          labels: {
            show: false
          }
        }
      },
      series: [
        {
          name: 'training',
          data: this.props.data.attendeeCount,
          color: "#1A56DB"
        }
      ]
    }
  }

  componentDidUpdate(prevProps: LineChartProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        options: {
          ...this.state.options,
          xaxis: {
            ...this.state.options.xaxis,
            categories: this.props.data.attendeeDates
          },
          title: {
            text: this.props.title
          }
        },
        series: [
          {
            name: 'training',
            data: this.props.data.attendeeCount,
            color: "#1A56DB"
          }
        ]
      });
    }
  }

  render() {
    return (
      <div className='w-full h-full'>
        <Chart options={this.state.options} series={this.state.series} type="area" width="100%" height="100%" />
      </div>
    )
  }
}

export default LineChart
