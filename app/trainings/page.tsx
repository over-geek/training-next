"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, Calendar, Users, BookOpen, Clock, MoreHorizontal, Trash2, Edit, Play, FileDown, Filter, Loader2, MessageSquare } from "lucide-react"
import { CheckIcon, PlusCircledIcon, CalendarIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilterPopover } from "@/components/ui/filter-popover"
import { AddTrainingSessionDialog } from "@/components/add-training-session-dialog"
import { useRouter } from "next/navigation"
import { TrainingService } from "@/services/trainings/training-service"
import type { TrainingSession } from "@/services/trainings/types"
import { toast } from "sonner"
import { QRCodeDialog } from "@/components/qr-code-dialog"

export default function TrainingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [audienceFilter, setAudienceFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [trainings, setTrainings] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null)
  const [selectedTrainingName, setSelectedTrainingName] = useState<string>("")
  const itemsPerPage = 5

  useEffect(() => {
    fetchTrainingSessions()
  }, [])

  const fetchTrainingSessions = async () => {
    try {
      setIsLoading(true)
      const data = await TrainingService.getTrainingSessions()
      setTrainings(data)
    } catch (error) {
      console.error('Failed to fetch training sessions:', error)
      toast.error('Failed to load training sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredData = trainings.filter(training => {
    const matchesSearch = training.trainingName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === "all" || training.status === statusFilter
    const matchesType = !typeFilter || typeFilter === "all" || training.trainingType === typeFilter
    const matchesAudience = !audienceFilter || audienceFilter === "all" || training.audienceType === audienceFilter
    const matchesDate = !dateFilter || dateFilter === "all" || training.date >= dateFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesAudience && matchesDate
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const upcomingTrainings = trainings.filter(t => t.status === "upcoming").length
  const trainingsThisYear = trainings.length
  const inProgressTrainings = trainings.filter(t => t.status === "in-progress").length
  const completedTrainings = trainings.filter(t => t.status === "done").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>
      case "done":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Done</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAction = async (action: string, trainingId: number, trainingName?: string) => {
    if (action === "delete") {
      try {
        await TrainingService.deleteTrainingSession(trainingId)
        await fetchTrainingSessions()
        toast.success('Training session deleted successfully!')
      } catch (error) {
        console.error('Failed to delete training session:', error)
        toast.error('Failed to delete training session. Please try again.')
      }
    } else if (action === "export") {
      try {
        await TrainingService.exportAttendanceLogsPDF(trainingId)
        toast.success('Attendance logs exported successfully!')
      } catch (error) {
        console.error('Failed to export attendance logs:', error)
        toast.error('Failed to export attendance logs. Please try again.')
      }
    } else if (action === "responses") {
      setSelectedTrainingId(trainingId)
      setSelectedTrainingName(trainingName || "")
      setIsQRDialogOpen(true)
    } else {
      console.log(`${action} action for training ID: ${trainingId}`)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setAudienceFilter("all")
    setDateFilter("all")
    setCurrentPage(1)
  }

  const handleAddTraining = async () => {
    await fetchTrainingSessions()
    setCurrentPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Training Sessions</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trainings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrainings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trainings This Year</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingsThisYear}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTrainings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrainings}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search training sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterPopover
              title="Date"
              icon={Calendar}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              value={dateFilter}
              onValueChange={setDateFilter}
              options={[
                { label: "All Dates", value: "all" },
                { label: "From June 2024", value: "2024-06-01" },
                { label: "From July 2024", value: "2024-07-01" },
                { label: "From August 2024", value: "2024-08-01" },
              ]}
              placeholder="Search dates..."
            />
            <FilterPopover
              title="Status"
              icon={PlusCircledIcon}
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Upcoming", value: "upcoming" },
                { label: "In Progress", value: "in-progress" },
                { label: "Done", value: "done" },
              ]}
              placeholder="Search status..."
            />
            <FilterPopover
              title="Training Type"
              icon={BookOpen}
              value={typeFilter}
              onValueChange={setTypeFilter}
              options={[
                { label: "All Types", value: "all" },
                { label: "Staff Training", value: "Staff Training" },
                { label: "Staff Forum", value: "Staff Forum" },
              ]}
              placeholder="Search types..."
            />
            <FilterPopover
              title="Audience"
              icon={Users}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              value={audienceFilter}
              onValueChange={setAudienceFilter}
              options={[
                { label: "All Audiences", value: "all" },
                { label: "All", value: "ALL" },
                { label: "Department", value: "DEPARTMENT" },
                { label: "Specific Employees", value: "SPECIFIC" },
              ]}
              placeholder="Search audience..."
            />
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <AddTrainingSessionDialog onAddTraining={handleAddTraining}>
              <Button className="ml-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Training Session
              </Button>
            </AddTrainingSessionDialog>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Facilitator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading training sessions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((training) => {
                  const router = useRouter();
                  
                  const handleRowClick = () => {
                    router.push(`/trainings/${training.id}`);
                  };

                  // Format date for display
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  };

                  // Format audience type for display
                  const formatAudienceType = (audienceType: string) => {
                    switch (audienceType) {
                      case 'ALL': return 'All';
                      case 'DEPARTMENT': return 'Department';
                      case 'SPECIFIC': return 'Specific Employees';
                      default: return audienceType;
                    }
                  };
                  
                  return (
                    <TableRow 
                      key={training.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={handleRowClick}
                    >
                      <TableCell className="font-medium">{formatDate(training.date)}</TableCell>
                      <TableCell>{training.trainingName}</TableCell>
                      <TableCell>{training.facilitator}</TableCell>
                      <TableCell>{training.trainingType}</TableCell>
                      <TableCell>{formatAudienceType(training.audienceType)}</TableCell>
                      <TableCell>{training.duration}h</TableCell>
                      <TableCell>{training.startTime}</TableCell>
                      <TableCell>{getStatusBadge(training.status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("edit", training.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("start", training.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Session
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("responses", training.id, training.trainingName)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Take Responses
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("export", training.id)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction("delete", training.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No training sessions found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
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
      {selectedTrainingId && (
        <QRCodeDialog
          isOpen={isQRDialogOpen}
          onClose={() => {
            setIsQRDialogOpen(false)
            setSelectedTrainingId(null)
            setSelectedTrainingName("")
          }}
          trainingId={selectedTrainingId}
          trainingName={selectedTrainingName}
        />
      )}
    </div>
  )
}
