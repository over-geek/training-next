"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { ControlHeader } from "./control-header"
import { SummaryRibbon } from "./summary-ribbon"
import { TrackingTable } from "./tracking-table"
import type { TrainingSession, EvaluationStatus, TrainingEffectivenessEvaluation } from "./types"
import { useTrainingEffectivenessEvals, useResendNudge } from "@/hooks/queries"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const mapApiResponseToTrainingSession = (apiData: TrainingEffectivenessEvaluation): TrainingSession => {
  const trainingDate = new Date(apiData.trainingSessionDate);
  let dueDate: string;

  if (apiData.milestone === "THREE_MONTH") {
    const dueDateObj = new Date(trainingDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + 3);
    dueDate = dueDateObj.toISOString().split('T')[0];
  } else {
    const dueDateObj = new Date(trainingDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + 1);
    dueDate = dueDateObj.toISOString().split('T')[0];
  }

  return {
    id: apiData.id.toString(),
    sessionName: apiData.trainingSessionName,
    managerName: apiData.managerName,
    department: apiData.departmentName,
    dueDate,
    status: apiData.status as EvaluationStatus,
  };
}

export function TrainingEffectivenessTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | "all">("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data: rawData = [], isLoading } = useTrainingEffectivenessEvals()
  const resendNudgeMutation = useResendNudge()
  const sessions = useMemo(() => rawData.map(mapApiResponseToTrainingSession), [rawData])

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        searchQuery === "" ||
        session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.department.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || session.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [sessions, searchQuery, statusFilter])

  const metrics = useMemo(() => {
    const sessionsDue = sessions.filter((s) => s.status === "PENDING_MANAGER").length
    const totalSessions = sessions.length
    const completedByManager = sessions.filter(
      (s) => s.status === "PENDING_HR_BP" || s.status === "COMPLETED",
    ).length
    const completionRate = Math.round((completedByManager / totalSessions) * 100)
    const pendingHRAction = sessions.filter((s) => s.status === "PENDING_HR_BP").length

    return { sessionsDue, completionRate, pendingHRAction }
  }, [sessions])

  const handleResendNudge = async (sessionId: string) => {
    try {
      await resendNudgeMutation.mutateAsync(sessionId)
      toast.success("Nudge sent successfully!")
    } catch {
      toast.error("Failed to send nudge. Please try again.")
    }
  }

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids)
  }

  const handleDownloadSelected = () => {
    console.log("Downloading records for:", selectedIds)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Control header skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Skeleton className="h-10 w-full sm:max-w-sm rounded" />
          <Skeleton className="h-10 w-40 rounded" />
        </div>
        {/* Summary ribbon skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tracking table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <ControlHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <SummaryRibbon
        sessionsDue={metrics.sessionsDue}
        completionRate={metrics.completionRate}
        pendingHRAction={metrics.pendingHRAction}
      />

      <TrackingTable
        sessions={filteredSessions}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onResendNudge={handleResendNudge}
        onDownloadSelected={handleDownloadSelected}
      />
    </div>
  )
}
