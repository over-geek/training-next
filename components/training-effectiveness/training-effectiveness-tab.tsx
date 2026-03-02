"use client"

import { useState, useMemo } from "react"
import { ControlHeader } from "./control-header"
import { SummaryRibbon } from "./summary-ribbon"
import { TrackingTable } from "./tracking-table"
import type { TrainingSession, EvaluationStatus, TrainingEffectivenessEvaluation } from "./types"
import { Loader2 } from "lucide-react"
import { useTrainingEffectivenessEvals } from "@/hooks/queries"

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

  const handleResendNudge = (sessionId: string) => {
    console.log("Sending nudge for session:", sessionId)
  }

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids)
  }

  const handleDownloadSelected = () => {
    console.log("Downloading records for:", selectedIds)
  }

  if (isLoading) {
    return (
      <div className="p-6 h-screen">
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xl">Loading training effectiveness data...</span>
          </div>
        </div>
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
