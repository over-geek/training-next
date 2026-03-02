"use client"

import { Download, Send } from "lucide-react"
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
  onDownloadSelected: () => void
}

function StatusBadge({ status }: { status: TrainingSession["status"] }) {
  const config: Record<TrainingSession["status"], { label: string; className: string }> = {
    PENDING_MANAGER: {
      label: "Pending Manager",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
    PENDING_SIGNATURES: {
      label: "Pending Signatures",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-green-500 text-white border-green-500/30 hover:bg-green-500/20",
    },
    PENDING_HR_BP: {
      label: "Pending HR/BP",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
    },
  }

  const statusConfig = config[status] || {
    label: status || "Unknown",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/20",
  }

  const { label, className } = statusConfig

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResendNudge(session.id)}
                    disabled={session.status !== "PENDING_MANAGER"}
                    className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Nudge
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
