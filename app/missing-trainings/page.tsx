"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Search, Users, AlertTriangle, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar } from "@/components/ui/avatar"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { TrainingService } from "@/services/trainings/training-service"
import type { UncompletedTraining } from "@/services/trainings/types"
import { toast } from "sonner"

export default function MissingTrainingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [trainings, setTrainings] = useState<UncompletedTraining[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>(["All Departments"])

  useEffect(() => {
    fetchUncompletedTrainings()
  }, [])

  const fetchUncompletedTrainings = async () => {
    try {
      setIsLoading(true)
      const data = await TrainingService.getUncompletedTrainings()
      setTrainings(data)
    
      const uniqueDepartments = new Set<string>()
      data.forEach(training => {
        training.missingEmployees.forEach(employee => {
          uniqueDepartments.add(employee.department)
        })
      })
      setDepartments(["All Departments", ...Array.from(uniqueDepartments).sort()])
      
    } catch (error) {
      console.error('Failed to fetch uncompleted trainings:', error)
      toast.error('Failed to load missing trainings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter trainings based on search term
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training =>
      training.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, trainings])

  // Filter people in expanded training by department
  const getFilteredPeople = (training: UncompletedTraining) => {
    if (selectedDepartment === "All Departments") {
      return training.missingEmployees
    }
    return training.missingEmployees.filter(person => person.department === selectedDepartment)
  }



  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const totalIncompleteTrainings = filteredTrainings.length
  const totalPendingEmployees = filteredTrainings.reduce((sum, training) => sum + training.missingEmployees.length, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Missing Trainings</h1>
          <p className="text-muted-foreground">Track uncompleted trainings and employees who need to complete them</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete Trainings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalIncompleteTrainings
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Trainings with incomplete progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalPendingEmployees
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all incomplete trainings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : filteredTrainings.length > 0 ? (
                Math.round(filteredTrainings.reduce((sum, t) => sum + t.completionRate, 0) / filteredTrainings.length)
              ) : (
                0
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all trainings
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainings by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading missing trainings...</span>
              </div>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredTrainings.map((training) => {
                const filteredPeople = getFilteredPeople(training)
                const remainingCount = training.totalRequired - training.completed

                return (
                  <AccordionItem key={training.id} value={`training-${training.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-left">{training.name}</h3>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {Math.round(training.completionRate)}%
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(training.completionRate)}`}
                                style={{ width: `${training.completionRate}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {remainingCount} people left
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {training.completed}/{training.totalRequired} completed
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">
                            Employees who need to complete this training
                            {selectedDepartment !== "All Departments" && (
                              <span className="text-muted-foreground font-normal"> ({selectedDepartment})</span>
                            )}
                          </h4>
                          <Badge variant="secondary">
                            {filteredPeople.length} employee{filteredPeople.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {filteredPeople.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredPeople.map((person) => (
                              <div key={person.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border">
                                <Avatar name={person.name} className="h-8 w-8" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{person.name}</p>
                                  <p className="text-xs text-muted-foreground">{person.department}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No employees from {selectedDepartment} need to complete this training
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {!isLoading && filteredTrainings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainings found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "No trainings match your search criteria." : "All trainings are 100% complete!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
