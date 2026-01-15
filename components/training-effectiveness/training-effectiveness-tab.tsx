"use client"

import { useState, useMemo } from "react"
import { ControlHeader } from "./control-header"
import { SummaryRibbon } from "./summary-ribbon"
import { TrackingTable } from "./tracking-table"
import { ReviewDrawer } from "./review-drawer"
import type { TrainingSession, EvaluationStatus } from "./types"

const mockData: TrainingSession[] = [
  {
    id: "1",
    sessionName: "Q1 Leadership Workshop",
    managerName: "Sarah Jenkins",
    department: "Engineering",
    dueDate: "2026-01-20",
    status: "manager_submitted",
    scores: { knowledge: 4.2, application: 3.8, behavior: 4.0, results: 3.5 },
    comments:
      "Team showed strong improvement in leadership communication skills. Recommending follow-up coaching for 2 team members.",
  },
  {
    id: "2",
    sessionName: "Agile Methodology Training",
    managerName: "Michael Chen",
    department: "Product",
    dueDate: "2026-01-18",
    status: "pending_manager",
    scores: null,
    comments: null,
  },
  {
    id: "3",
    sessionName: "Cybersecurity Awareness Program",
    managerName: "Emily Rodriguez",
    department: "IT Security",
    dueDate: "2026-01-15",
    status: "hr_approved",
    scores: { knowledge: 4.5, application: 4.2, behavior: 4.3, results: 4.1 },
    comments: "Excellent adoption of security protocols. Zero incidents reported post-training.",
  },
  {
    id: "4",
    sessionName: "Customer Service Excellence",
    managerName: "James Wilson",
    department: "Support",
    dueDate: "2026-01-22",
    status: "manager_submitted",
    scores: { knowledge: 3.9, application: 4.0, behavior: 3.7, results: 4.2 },
    comments: "NPS scores improved by 15% following training completion. Team engagement is high.",
  },
  {
    id: "5",
    sessionName: "Financial Compliance Update",
    managerName: "Lisa Thompson",
    department: "Finance",
    dueDate: "2026-01-25",
    status: "pending_manager",
    scores: null,
    comments: null,
  },
  {
    id: "6",
    sessionName: "DEI Foundations Workshop",
    managerName: "David Park",
    department: "HR",
    dueDate: "2026-01-12",
    status: "hr_approved",
    scores: { knowledge: 4.6, application: 4.4, behavior: 4.5, results: 4.3 },
    comments: "Strong participation and positive feedback. Team implementing inclusive practices.",
  },
  {
    id: "7",
    sessionName: "Project Management Fundamentals",
    managerName: "Rachel Green",
    department: "Operations",
    dueDate: "2026-01-28",
    status: "pending_manager",
    scores: null,
    comments: null,
  },
  {
    id: "8",
    sessionName: "Data Analytics Bootcamp",
    managerName: "Kevin Brown",
    department: "Analytics",
    dueDate: "2026-01-19",
    status: "manager_submitted",
    scores: { knowledge: 4.1, application: 3.6, behavior: 3.9, results: 3.8 },
    comments: "Team is applying new skills to dashboards. Need more practice with advanced visualizations.",
  },
  {
    id: "9",
    sessionName: "Communication Skills Masterclass",
    managerName: "Amanda Foster",
    department: "Sales",
    dueDate: "2026-01-16",
    status: "manager_submitted",
    scores: { knowledge: 4.3, application: 4.5, behavior: 4.2, results: 4.6 },
    comments: "Sales conversion rate increased by 12%. Team demonstrates improved client engagement.",
  },
  {
    id: "10",
    sessionName: "Change Management Training",
    managerName: "Robert Martinez",
    department: "Strategy",
    dueDate: "2026-01-30",
    status: "pending_manager",
    scores: null,
    comments: null,
  },
]

export function TrainingEffectivenessTab() {
  const [sessions, setSessions] = useState<TrainingSession[]>(mockData)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | "all">("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewSession, setReviewSession] = useState<TrainingSession | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
    const sessionsDue = sessions.filter((s) => s.status === "pending_manager").length
    const totalSessions = sessions.length
    const completedByManager = sessions.filter(
      (s) => s.status === "manager_submitted" || s.status === "hr_approved",
    ).length
    const completionRate = Math.round((completedByManager / totalSessions) * 100)
    const pendingHRAction = sessions.filter((s) => s.status === "manager_submitted").length

    return { sessionsDue, completionRate, pendingHRAction }
  }, [sessions])

  const handleResendNudge = (sessionId: string) => {
    console.log("Sending nudge for session:", sessionId)
  }

  const handleReviewApprove = (session: TrainingSession) => {
    setReviewSession(session)
    setDrawerOpen(true)
  }

  const handleApprove = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "hr_approved" as const } : s)))
    setDrawerOpen(false)
    setReviewSession(null)
  }

  const handleViewRecord = (session: TrainingSession) => {
    setReviewSession(session)
    setDrawerOpen(true)
  }

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids)
  }

  const handleDownloadSelected = () => {
    console.log("Downloading records for:", selectedIds)
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
        onReviewApprove={handleReviewApprove}
        onViewRecord={handleViewRecord}
        onDownloadSelected={handleDownloadSelected}
      />

      <ReviewDrawer open={drawerOpen} onOpenChange={setDrawerOpen} session={reviewSession} onApprove={handleApprove} />
    </div>
  )
}
