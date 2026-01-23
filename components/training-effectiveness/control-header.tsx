"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EvaluationStatus } from "./types"

interface ControlHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: EvaluationStatus | "all"
  onStatusFilterChange: (value: EvaluationStatus | "all") => void
}

export function ControlHeader({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange }: ControlHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Post-Training Effectiveness (3-Month Review)</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings or managers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as EvaluationStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
            <SelectValue placeholder="Evaluation Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING_MANAGER">Pending Manager</SelectItem>
            <SelectItem value="PENDING_HR_BP">Pending HR BP</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
