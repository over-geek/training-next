"use client"

import { useState } from "react"
import { CheckCircle2, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import type { TrainingSession } from "./types"

interface ReviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: TrainingSession | null
  onApprove: (sessionId: string) => void
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const percentage = (score / 5) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{score.toFixed(1)}/5.0</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

export function ReviewDrawer({ open, onOpenChange, session, onApprove }: ReviewDrawerProps) {
  const [signature, setSignature] = useState("")
  const [isApproving, setIsApproving] = useState(false)

  if (!session) return null

  const isApproved = session.status === "hr_approved"
  const averageScore = session.scores
    ? (
        (session.scores.knowledge + session.scores.application + session.scores.behavior + session.scores.results) /
        4
      ).toFixed(2)
    : "N/A"

  const handleApprove = async () => {
    if (!signature.trim()) return
    setIsApproving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onApprove(session.id)
    setSignature("")
    setIsApproving(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl">{isApproved ? "Training Record" : "Review & Approve"}</SheetTitle>
          <SheetDescription>
            {session.sessionName} • {session.managerName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Session Details */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="font-medium text-foreground">Session Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="text-foreground">{session.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="text-foreground">
                  {new Date(session.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Consolidated Scores */}
          {session.scores && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Consolidated Team Scores</h3>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-lg font-semibold text-success">{averageScore}</p>
                </div>
              </div>

              <div className="space-y-3">
                <ScoreBar score={session.scores.knowledge} label="Knowledge Retention" />
                <ScoreBar score={session.scores.application} label="Skill Application" />
                <ScoreBar score={session.scores.behavior} label="Behavior Change" />
                <ScoreBar score={session.scores.results} label="Business Results" />
              </div>
            </div>
          )}

          {/* Score Breakdown Table */}
          {session.scores && (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Dimension</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Knowledge Retention</TableCell>
                    <TableCell className="text-right">{session.scores.knowledge}</TableCell>
                    <TableCell className="text-right text-success">
                      {session.scores.knowledge >= 4
                        ? "Excellent"
                        : session.scores.knowledge >= 3
                          ? "Good"
                          : "Needs Work"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Skill Application</TableCell>
                    <TableCell className="text-right">{session.scores.application}</TableCell>
                    <TableCell className="text-right text-success">
                      {session.scores.application >= 4
                        ? "Excellent"
                        : session.scores.application >= 3
                          ? "Good"
                          : "Needs Work"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Behavior Change</TableCell>
                    <TableCell className="text-right">{session.scores.behavior}</TableCell>
                    <TableCell className="text-right text-success">
                      {session.scores.behavior >= 4
                        ? "Excellent"
                        : session.scores.behavior >= 3
                          ? "Good"
                          : "Needs Work"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Business Results</TableCell>
                    <TableCell className="text-right">{session.scores.results}</TableCell>
                    <TableCell className="text-right text-success">
                      {session.scores.results >= 4 ? "Excellent" : session.scores.results >= 3 ? "Good" : "Needs Work"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Manager Comments */}
          {session.comments && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-medium text-foreground">Manager Comments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{session.comments}</p>
            </div>
          )}

          {/* Digital Signature & Approve */}
          {!isApproved && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Digital Signature</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature" className="text-sm text-muted-foreground">
                  Type your full name to sign off on this evaluation
                </Label>
                <Input
                  id="signature"
                  placeholder="Enter your full name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <Button
                className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90"
                onClick={handleApprove}
                disabled={!signature.trim() || isApproving}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? "Approving..." : "Digital Signature & Approve"}
              </Button>
            </div>
          )}

          {/* Already Approved Message */}
          {isApproved && (
            <div className="rounded-lg border border-success/30 bg-success/10 p-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">This evaluation has been approved by HR</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
