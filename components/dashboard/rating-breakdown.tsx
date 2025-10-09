"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface RatingBreakdown {
  rating: string;
  count: number;
  percentage: number;
}

interface RatingBreakdownProps {
  data: RatingBreakdown[];
}

export default function RatingBreakdown({ data }: RatingBreakdownProps) {
  const options = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false
      }
    },
    labels: data.map(item => item.rating),
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      markers: {
        width: 8,
        height: 8
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return Math.round(val) + '%'
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          fontSize: '10px'
        }
      }
    }],
    series: data.map(item => item.percentage)
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Training Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)]">
          <div className="h-full flex flex-col">
            {data.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl text-muted-foreground mb-2">📊</div>
                  <h3 className="text-lg font-semibold mb-1">No Data</h3>
                  <p className="text-sm text-muted-foreground">No rating data available yet</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  {typeof window !== 'undefined' && (
                    <Chart
                      options={options as any}
                      series={options.series}
                      type="donut"
                      height="100%"
                      width="100%"
                    />
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {data.map((item, index) => (
                    <div key={item.rating} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: options.colors[index] }}
                      />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-muted-foreground">({item.count})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
