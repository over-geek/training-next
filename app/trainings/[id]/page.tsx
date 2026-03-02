"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { 
  FileDown, MessageSquare, Users, ClipboardCheck, ChevronLeft, Play, Square, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dynamic from "next/dynamic"
import Link from "next/link"
import { TrainingService } from "@/services/trainings/training-service"
import type { AttendanceLog } from "@/services/trainings/types"
import {
  useTrainingSessionById,
  useAttendanceLogs,
  useTrainingResponses,
  useTrainingMetrics,
  useStartTrainingSession,
  useEndTrainingSession,
} from "@/hooks/queries"
import { useAppStore, type AttendanceData } from "@/lib/store"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/hooks/queries/query-keys"
import { toast } from "sonner"
import { QRCodeDialog } from "@/components/qr-code-dialog"

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false })
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false })

export default function TrainingDetailsPage() {
  const params = useParams()
  const trainingId = Number(params?.id)

  const [currentPage, setCurrentPage] = useState(1)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  // Live attendees appended via WebSocket (merged with server data below)
  const [liveAttendees, setLiveAttendees] = useState<AttendanceLog[]>([])
  const itemsPerPage = 5

  const { data: training, isLoading: trainingLoading } = useTrainingSessionById(trainingId)
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceLogs(trainingId)
  const { data: responses = [] } = useTrainingResponses(trainingId)
  const { data: metricsData } = useTrainingMetrics(training?.trainingName ?? "")

  const startMutation = useStartTrainingSession()
  const endMutation = useEndTrainingSession()

  const connectWs = useAppStore((s) => s.connectWs)
  const disconnectWs = useAppStore((s) => s.disconnectWs)

  const isLoading = trainingLoading || attendanceLoading

  // WebSocket handlers
  const handleNewAttendance = useCallback((data: AttendanceData) => {
    setLiveAttendees((prev) => {
      if (prev.some((a) => a.employeeName === data.employeeName)) return prev
      return [...prev, { employeeName: data.employeeName, employeeDepartment: data.employeeDepartment, createdOn: data.createdOn }]
    })
    // Also invalidate the server-side attendance cache so a refetch will include it
    queryClient.invalidateQueries({ queryKey: queryKeys.attendanceLogs(trainingId) })
  }, [trainingId])

  const handleWsError = useCallback((message: string) => {
    toast.error('Connection Error', { description: message })
  }, [])

  useEffect(() => {
    if (training?.status === 'in-progress') {
      connectWs(trainingId.toString(), handleNewAttendance, handleWsError)
    } else {
      disconnectWs()
    }
    return () => { disconnectWs() }
  }, [training?.status, trainingId, connectWs, disconnectWs, handleNewAttendance, handleWsError])

  // Merge server attendees + live WebSocket attendees (deduplicated)
  const serverAttendees = attendanceData?.attendees ?? []
  const allAttendees = [
    ...serverAttendees,
    ...liveAttendees.filter(
      (live) => !serverAttendees.some((s) => s.employeeName === live.employeeName)
    ),
  ]

  const totalPages = Math.ceil(allAttendees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAttendees = allAttendees.slice(startIndex, startIndex + itemsPerPage)

  const handleStartSession = async () => {
    if (!training) return
    startMutation.mutate(training.id, {
      onSuccess: () => toast.success('Training session started successfully!'),
      onError: (error) => toast.error('Failed to start training session', { description: (error as Error)?.message }),
    })
  }

  const handleEndSession = async () => {
    if (!training) return
    disconnectWs()
    endMutation.mutate(training.id, {
      onSuccess: () => toast.success('Training session ended successfully!'),
      onError: (error) => toast.error('Failed to end training session', { description: (error as Error)?.message }),
    })
  }

  const handleExportResponses = async () => {
    if (!training) return
    try {
      await TrainingService.exportResponsesZIP(training.id)
      toast.success('Evaluation responses exported successfully!')
    } catch (error) {
      toast.error('Failed to export responses', { description: (error as Error)?.message })
    }
  }

  const isUpdatingStatus = startMutation.isPending || endMutation.isPending

  const renderActionButtons = () => {
    if (!training) return null
    const status = training.status
    if (status === 'upcoming') {
      return (
        <div className="space-x-2">
          <Button variant="outline" disabled><MessageSquare className="h-4 w-4 mr-2" />Take Responses</Button>
          <Button onClick={handleStartSession} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Start Session
          </Button>
        </div>
      )
    } else if (status === 'in-progress') {
      return (
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsQRDialogOpen(true)}><MessageSquare className="h-4 w-4 mr-2" />Take Responses</Button>
          <Button onClick={handleEndSession} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
            End Session
          </Button>
        </div>
      )
    } else {
      return (
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsQRDialogOpen(true)}><MessageSquare className="h-4 w-4 mr-2" />Take Responses</Button>
          <Button onClick={handleExportResponses}><FileDown className="h-4 w-4 mr-2" />Export Responses</Button>
        </div>
      )
    }
  }

  if (!training && isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading training details...</span>
        </div>
      </div>
    )
  }

  if (!training) {
    return (
      <div className="p-6">
        <Link href="/trainings" className="flex items-center text-sm text-muted-foreground mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />Back to Trainings
        </Link>
        <div className="text-center py-8"><p className="text-muted-foreground">Training not found</p></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/trainings" className="flex items-center text-sm text-muted-foreground mb-4 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" />Back to Trainings
      </Link>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><p className="font-medium">Agenda:</p><span>{training.trainingName}</span></div>
          <div className="flex items-center gap-2"><p className="font-medium">Facilitator:</p><span>{training.facilitator}</span></div>
        </div>
        {renderActionButtons()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className='h-40'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : allAttendees.length}
            </div>
          </CardContent>
        </Card>
        <Card className='h-40'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : responses.length}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 h-40 p-0">
          <CardContent>
            <div className="h-[150px] flex items-center justify-center">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" />
                : metricsData && metricsData.attendeeCount.length > 0 && typeof window !== 'undefined'
                  ? <LineChart data={metricsData} title="Attendance Rate Over Time" />
                  : <p className="text-sm text-muted-foreground">No attendance data</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 p-0">
          <CardContent>
            <div className="h-[150px] flex items-center justify-center">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" />
                : metricsData && metricsData.departmentBreakdown.length > 0 && typeof window !== 'undefined'
                  ? <PieChart data={metricsData} />
                  : <p className="text-sm text-muted-foreground">No department data</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check-in Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading attendance data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedAttendees.length > 0 ? (
                paginatedAttendees.map((attendee, index) => {
                  const checkInTime = new Date(attendee.createdOn)
                  const formattedTime = checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  return (
                    <TableRow key={`${attendee.employeeName}-${index}`}>
                      <TableCell className="font-medium">{attendee.employeeName}</TableCell>
                      <TableCell>{attendee.employeeDepartment}</TableCell>
                      <TableCell>{formattedTime}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No attendance records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allAttendees.length)} of {allAttendees.length} attendees
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <QRCodeDialog
        isOpen={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
        trainingId={trainingId}
        trainingName={training?.trainingName}
      />
    </div>
  )
}

