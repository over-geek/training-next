"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface AreaChartProps {
  data: {
    monthlyTrainings: number[];
    monthlyAttendees: number[];
    monthlyResponses: number[];
  };
}

export default function AreaChart({ data }: AreaChartProps) {
  if (!data) return null;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const options = {
    series: [
      {
        name: 'Trainings',
        color: '#b2ccff',
        data: data.monthlyTrainings || [],
      },
      {
        name: 'Attendees',
        color: '#84adff',
        data: data.monthlyAttendees || [],
      },
      {
        name: 'Evaluations',
        color: '#528bff',
        data: data.monthlyResponses || [],
      },
    ],
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
        borderRadiusApplication: 'end' as 'end',
      },
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: months,
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Training Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)]">
          <div className="h-full">
            {typeof window !== 'undefined' && (
              <Chart
                options={options}
                series={options.series}
                type="area"
                height="100%"
                width="100%"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
