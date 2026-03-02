import React, { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import type { TrainingMetrics } from '@/services/trainings/types'

interface PieChartProps {
  data: TrainingMetrics;
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const options = {
    series: data.departmentBreakdown,
    labels: data.departmentNames,
    chart: {
      type: 'pie' as const,
      toolbar: {
        show: false
      }
    },
    legend: {
      position: 'bottom' as const
    },
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'],
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + "%"
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  if (!mounted) return null

  return (
    <div className='h-full'>
      <Chart options={options} series={options.series} type="pie" width="380" height="100%" />
    </div>
  )
}

export default PieChart
