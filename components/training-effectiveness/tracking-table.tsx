"use client"

import { Download, Send, Eye, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { TrainingSession } from "./types"

interface TrackingTableProps {
  sessions: TrainingSession[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onResendNudge: (sessionId: string) => void
  onReviewApprove: (session: TrainingSession) => void
  onViewRecord: (session: TrainingSession) => void
  onDownloadSelected: () => void
}

function StatusBadge({ status }: { status: TrainingSession["status"] }) {
  const config = {
    PENDING_MANAGER: {
      label: "Pending Manager",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
    PENDING_HR_BP: {
      label: "Pending HR BP",
      className: "bg-info/15 text-info border-info/30 hover:bg-info/20",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-success/15 text-success border-success/30 hover:bg-success/20",
    },
  }

  const { label, className } = config[status]

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TrackingTable({
  sessions,
  selectedIds,
  onSelectionChange,
  onResendNudge,
  onReviewApprove,
  onViewRecord,
  onDownloadSelected,
}: TrackingTableProps) {
  const allSelected = sessions.length > 0 && selectedIds.length === sessions.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < sessions.length

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(sessions.map((s) => s.id))
    }
  }

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedIds.length > 0
            ? `${selectedIds.length} session${selectedIds.length > 1 ? "s" : ""} selected`
            : `${sessions.length} total sessions`}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={onDownloadSelected}
          className="gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Download Selected as ZIP
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className={someSelected ? "data-[state=checked]:bg-primary" : ""}
                  ref={(el) => {
                    if (el) {
                      ;(el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected
                    }
                  }}
                />
              </TableHead>
              <TableHead>Training Session</TableHead>
              <TableHead>Line Manager</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="bg-card">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(session.id)}
                    onCheckedChange={() => toggleOne(session.id)}
                    aria-label={`Select ${session.sessionName}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">{session.sessionName}</TableCell>
                <TableCell className="text-muted-foreground">{session.managerName}</TableCell>
                <TableCell className="text-muted-foreground">{session.department}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(session.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={session.status} />
                </TableCell>
                <TableCell className="text-right">
                  {session.status === "PENDING_MANAGER" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResendNudge(session.id)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Send className="h-4 w-4" />
                      Resend Nudge
                    </Button>
                  )}
                  {session.status === "PENDING_HR_BP" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onReviewApprove(session)}
                      className="gap-2 bg-info text-info-foreground hover:bg-info/90"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Review & Approve
                    </Button>
                  )}
                  {session.status === "COMPLETED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewRecord(session)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                      View Record
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
