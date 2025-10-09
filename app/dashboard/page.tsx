"use client"

import React, { useState, useEffect } from "react"
import SummaryCards from "@/components/dashboard/summary-cards"
import AreaChart from "@/components/dashboard/area-chart"
import ActivityFeed from "@/components/dashboard/activity-feed"
import AttendedTrainings from "@/components/dashboard/attended-trainings"
import RatingBreakdown from "@/components/dashboard/rating-breakdown"
import { TrainingService } from "@/services/trainings/training-service"
import type { DashboardMetrics } from "@/services/trainings/types"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const data = await TrainingService.getDashboardMetrics()
      setDashboardData(data)
      console.log(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 h-screen">
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xl">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6 h-screen">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Dashboard Unavailable</h2>
            <p className="text-muted-foreground">Unable to load dashboard data. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-screen">
      <div className="h-full flex flex-col space-y-6">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex-shrink-0">
          <SummaryCards 
            totalCompletedTrainings={dashboardData.totalCompletedTrainings}
            upcomingTrainings={dashboardData.upcomingTrainings}
            averageAttendees={dashboardData.averageAttendees}
            averageResponses={dashboardData.averageResponses}
          />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 h-full flex flex-col space-y-6">
            <div className="flex-1 max-h-80">
              <AreaChart data={dashboardData.twelveMonths} />
            </div>
            <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
              <div className="h-full">
                <AttendedTrainings 
                  mostAttended={dashboardData.highestAttendance[0] || null}
                  leastAttended={dashboardData.lowestAttendance || null}
                />
              </div>
              <div className="lg:col-span-2">
                <RatingBreakdown data={
                  dashboardData.ratings.every(count => count === 0) 
                    ? [] 
                    : dashboardData.ratings.map((count, index) => ({
                        rating: `${index + 1} Star${index === 0 ? '' : 's'}`,
                        count,
                        percentage: dashboardData.ratings.reduce((sum, c) => sum + c, 0) > 0 
                          ? Math.round((count / dashboardData.ratings.reduce((sum, c) => sum + c, 0)) * 100)
                          : 0
                      }))
                } />
              </div>
            </div>
          </div>
          <div className="h-full pb-4">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
