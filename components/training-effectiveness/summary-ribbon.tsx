"use client"

import { CalendarClock, TrendingUp, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SummaryRibbonProps {
  sessionsDue: number
  completionRate: number
  pendingHRAction: number
}

export function SummaryRibbon({ sessionsDue, completionRate, pendingHRAction }: SummaryRibbonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sessions Due */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-md">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Sessions Due</p>
            <p className="text-2xl font-semibold text-foreground">{sessionsDue}</p>
            <p className="text-xs text-muted-foreground">Passed 90-day mark</p>
          </div>
        </div>
      </div>

      {/* Manager Completion Rate */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-md">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Manager Completion Rate</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-foreground">{completionRate}%</p>
              <Progress value={completionRate} className="flex-1 h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending HR Action */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-warning">Pending HR Action</p>
            <p className="text-2xl font-semibold text-warning">{pendingHRAction}</p>
            <p className="text-xs text-warning/80">Awaiting HRBP sign-off</p>
          </div>
        </div>
      </div>
    </div>
  )
}
