import React, { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import type { TrainingMetrics } from '@/services/trainings/types'

interface LineChartProps {
  data: TrainingMetrics;
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const options = {
    chart: {
      id: 'basic-bar',
      toolbar: { show: false },
    },
    grid: { show: false },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shapeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    stroke: { curve: 'smooth' as const, width: 1 },
    tooltip: { x: { show: true } },
    title: { text: title },
    xaxis: {
      categories: data.attendeeDates,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { show: false } },
  }

  const series = [
    { name: 'training', data: data.attendeeCount, color: '#1A56DB' },
  ]

  if (!mounted) return null

  return (
    <div className='w-full h-full'>
      <Chart options={options} series={series} type="area" width="100%" height="100%" />
    </div>
  )
}

export default LineChart
