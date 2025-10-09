"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, UserX, Loader2, CreditCard, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { ScanAnimation } from "@/components/scan-animation"
import { EmployeeService } from "@/services/employees/employee-service"
import { DepartmentService } from "@/services/departments/department-service"
import type { Employee } from "@/services/employees/types"
import type { Department } from "@/services/departments/types"
import { toast } from "sonner"


export default function AttendeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<Employee | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCardScanning, setIsCardScanning] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    departmentId: 0
  })

  const itemsPerPage = 8

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const data = await EmployeeService.getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      toast.error('Failed to load employees. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      toast.error('Failed to load departments. Please try again.')
    }
  }

  const filteredAttendees = employees.filter(attendee =>
    (attendee.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAttendees = filteredAttendees.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
      : <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddAttendee = async () => {
    if (!isFormValid) return
    
    try {
      setIsSubmitting(true)
      await EmployeeService.createEmployee(formData)
      
      setFormData({
        name: "",
        email: "",
        departmentId: 0
      })
      setIsAddModalOpen(false)
      setCurrentPage(1)
      
      await fetchEmployees()
      toast.success('Employee added successfully!')
    } catch (error) {
      console.error('Failed to add employee:', error)
      toast.error('Failed to add employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRowClick = (attendee: Employee) => {
    setSelectedAttendee(attendee)
    setIsDetailsModalOpen(true)
  }

  const handleStatusToggle = async () => {
    if (!selectedAttendee) return
    
    try {
      if (selectedAttendee.status === "inactive") {
        setIsCardScanning(true)
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const cardResult = await EmployeeService.updateEmployeeCard(selectedAttendee.id)
        if (!cardResult) {
          toast.error('Failed to register card. Please try again.')
          return
        }
        setIsCardScanning(false)
        setIsUpdatingStatus(true)
        
        await EmployeeService.toggleEmployeeStatus(selectedAttendee.id)
        await fetchEmployees()
        const employees = await EmployeeService.getEmployees()
        const updatedEmployee = employees.find(emp => emp.id === selectedAttendee.id)
        
        if (!updatedEmployee) {
          throw new Error("Failed to find updated employee data")
        }
        
        toast.success('Employee re-registered successfully')
        setIsDetailsModalOpen(false)
      } else {
        setIsUpdatingStatus(true)
        await EmployeeService.toggleEmployeeStatus(selectedAttendee.id)
        await fetchEmployees()
        const employees = await EmployeeService.getEmployees()
        const updatedEmployee = employees.find(emp => emp.id === selectedAttendee.id)
        
        if (!updatedEmployee) {
          throw new Error("Failed to find updated employee data")
        }
        
        toast.success(`Employee status has been changed to ${updatedEmployee.status}`)
        setIsDetailsModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee status'
      toast.error(errorMessage)
    } finally {
      setIsUpdatingStatus(false)
      setIsCardScanning(false)
    }
  }


  const handleBackFromScanning = () => {
    setIsCardScanning(false)
  }

  const isFormValid = formData.name && formData.email && formData.departmentId > 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendees</h1>
      </div>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attendee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Attendee</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Add a new attendee to the system. They will be available for training assignments.
                  </p>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium">
                      Department
                    </label>
                    <Select value={formData.departmentId > 0 ? formData.departmentId.toString() : ""} onValueChange={(value) => handleInputChange("departmentId", parseInt(value))} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddAttendee}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Attendee'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>No. of Trainings</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading employees...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedAttendees.length > 0 ? (
                paginatedAttendees.map((attendee) => (
                  <TableRow 
                    key={attendee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(attendee)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar name={attendee.name} />
                        <span>{attendee.name || 'Unknown Employee'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{attendee.email || 'No email'}</TableCell>
                    <TableCell>{attendee.department || 'No department'}</TableCell>
                    <TableCell>{attendee.trainingsAttended}</TableCell>
                    <TableCell>{getStatusBadge(attendee.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAttendees.length)} of {filteredAttendees.length} results
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
          {filteredAttendees.length > 0 && totalPages <= 1 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAttendees.length} of {employees.length} employees
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendee Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={(open) => {
        setIsDetailsModalOpen(open)
        if (!open) {
          setIsCardScanning(false) // Reset card scanning state when modal closes
        }
      }}>
        <DialogContent className="sm:max-w-md">
          {selectedAttendee && (
            <>
              {isCardScanning ? (
                // Card Scanning Phase
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackFromScanning}
                        className="p-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <DialogTitle className="text-xl">Register Card</DialogTitle>
                        <p className="text-sm text-muted-foreground">{selectedAttendee.name}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="flex flex-col items-center justify-center py-8">
                    <ScanAnimation className="flex flex-col items-center" />
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Hold your card near the reader to register it to your account.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                // Normal Employee Details View
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={selectedAttendee.name} className="h-12 w-12" />
                      <div>
                        <DialogTitle className="text-xl">{selectedAttendee.name || 'Unknown Employee'}</DialogTitle>
                        <p className="text-sm text-muted-foreground">{selectedAttendee.email || 'No email provided'}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Department and Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                        <p className="font-medium">{selectedAttendee.department || 'No department'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        {getStatusBadge(selectedAttendee.status)}
                      </div>
                    </div>

                    {/* Training History */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Training History ({selectedAttendee.trainingHistory?.length || 0} trainings)
                      </p>
                      <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="space-y-3">
                          {selectedAttendee.trainingHistory && selectedAttendee.trainingHistory.length > 0 ? (
                            selectedAttendee.trainingHistory.map((training) => (
                              <div key={training.id} className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{training.name}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(training.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No training history available
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Dynamic Action Button */}
                    <div className="pt-4">
                      {selectedAttendee.status === 'active' ? (
                        <Button 
                          variant="destructive" 
                          onClick={handleStatusToggle}
                          disabled={isUpdatingStatus}
                          className="w-full"
                        >
                          {isUpdatingStatus ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Revoking Access...
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Revoke Access
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleStatusToggle}
                          disabled={isUpdatingStatus || isCardScanning}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isCardScanning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Registering Card...
                            </>
                          ) : isUpdatingStatus ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Register Card & Activate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
