"use client"

import React, { useState, useEffect } from "react"
import { CalendarIcon, Search, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { DepartmentService } from "@/services/departments/department-service"
import { EmployeeService } from "@/services/employees/employee-service"
import { TrainingService } from "@/services/trainings/training-service"
import type { Department } from "@/services/departments/types"
import type { Employee } from "@/services/employees/types"
import type { Training } from "@/services/trainings/types"

function DepartmentSelector({
  selectedValues,
  onSelectionChange,
  departments,
  isLoading,
}: {
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  departments: Department[]
  isLoading: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDepartments = departments.filter((dept) => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2 border rounded-md p-3">
      <div className="sticky top-0 bg-background pb-2">
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading departments...</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">No departments found</p>
        ) : (
          filteredDepartments.map((department) => (
            <div key={department.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${department.id}`}
                checked={selectedValues.includes(department.id.toString())}
                onCheckedChange={(checked) => {
                  const updatedList = checked
                    ? [...selectedValues, department.id.toString()]
                    : selectedValues.filter((value) => value !== department.id.toString())
                  onSelectionChange(updatedList)
                }}
              />
              <label
                htmlFor={`dept-${department.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {department.name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EmployeeSelector({
  selectedValues,
  onSelectionChange,
  employees,
  isLoading,
}: {
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  employees: Employee[]
  isLoading: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = employees.filter((employee) => 
    (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2 border rounded-md p-3">
      <div className="sticky top-0 bg-background pb-2">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading employees...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">No employees found</p>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="flex items-center space-x-2">
              <Checkbox
                id={`emp-${employee.id}`}
                checked={selectedValues.includes(employee.id.toString())}
                onCheckedChange={(checked) => {
                  const updatedList = checked
                    ? [...selectedValues, employee.id.toString()]
                    : selectedValues.filter((value) => value !== employee.id.toString())
                  onSelectionChange(updatedList)
                }}
              />
              <label
                htmlFor={`emp-${employee.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {employee.name || 'Unknown Employee'} ({employee.department || 'No Department'})
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface AddTrainingSessionDialogProps {
  onAddTraining: () => void // Changed to just refresh the list
  children: React.ReactNode
}

export function AddTrainingSessionDialog({ onAddTraining, children }: AddTrainingSessionDialogProps) {
  const [open, setOpen] = useState(false)
  const [trainingOpen, setTrainingOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isTrainingsLoading, setIsTrainingsLoading] = useState(false)
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  
  const [formData, setFormData] = useState({
    trainingId: 0,
    facilitator: "",
    duration: "",
    startTime: "",
    type: "Staff Training",
    date: "",
    audienceType: "ALL" as "ALL" | "DEPARTMENT" | "SPECIFIC",
    selectedEmployeeIds: [] as number[],
    targetDepartmentIds: [] as number[],
    // UI only fields
    selectedDepartments: [] as string[],
  })

  const [searchValue, setSearchValue] = useState("")

  const filteredTrainings = trainings.filter(training =>
    training.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Filter departments and employees based on selected training requirements
  const getFilteredDepartments = () => {
    if (!selectedTraining || selectedTraining.category !== 'DEPARTMENT') {
      return departments;
    }
    const requiredDeptIds = selectedTraining.requiredFor.map(dept => dept.id);
    return departments.filter(dept => requiredDeptIds.includes(dept.id));
  }

  const getFilteredEmployees = () => {
    if (!selectedTraining || selectedTraining.category !== 'SPECIFIC') {
      return employees;
    }
    const requiredDeptIds = selectedTraining.requiredFor.map(dept => dept.id);
    return employees.filter(emp => {
      // Find the employee's department and check if it's in the required list
      const empDept = departments.find(dept => dept.name === emp.department);
      return empDept && requiredDeptIds.includes(empDept.id);
    });
  }

  // Fetch trainings, departments and employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchTrainings()
      fetchDepartments()
      fetchEmployees()
    }
  }, [open])

  const fetchTrainings = async () => {
    try {
      setIsTrainingsLoading(true)
      const data = await TrainingService.getTrainings()
      setTrainings(data)
    } catch (error) {
      console.error('Failed to fetch trainings:', error)
      toast.error('Failed to load trainings')
    } finally {
      setIsTrainingsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      setIsDepartmentsLoading(true)
      const data = await DepartmentService.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setIsDepartmentsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      setIsEmployeesLoading(true)
      const data = await EmployeeService.getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      toast.error('Failed to load employees')
    } finally {
      setIsEmployeesLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      trainingId: 0,
      facilitator: "",
      duration: "",
      startTime: "",
      type: "Staff Training",
      date: "",
      audienceType: "ALL",
      selectedEmployeeIds: [],
      targetDepartmentIds: [],
      selectedDepartments: [],
    })
    setSelectedTraining(null)
    setSearchValue("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.facilitator || !formData.trainingId || !formData.date || !formData.startTime || !formData.duration) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check audience-specific requirements
    if (formData.audienceType === "DEPARTMENT" && formData.targetDepartmentIds.length === 0) {
      toast.error("Please select at least one department")
      return
    }

    if (formData.audienceType === "SPECIFIC" && formData.selectedEmployeeIds.length === 0) {
      toast.error("Please select at least one employee")
      return
    }

    try {
      // setIsSubmitting(true)
      const trainingData = {
        trainingId: formData.trainingId,
        facilitator: formData.facilitator,
        duration: formData.duration,
        startTime: formData.startTime,
        type: formData.type,
        date: formData.date,
        audienceType: formData.audienceType,
        selectedEmployeeIds: formData.selectedEmployeeIds,
        targetDepartmentIds: formData.targetDepartmentIds,
      }
      await TrainingService.createTrainingSession(trainingData)
      
      onAddTraining() // Refresh the trainings list
      toast.success("Training session created successfully!")
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create training session:', error)
      toast.error("Failed to create training session. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.facilitator && 
    formData.trainingId && 
    formData.date && 
    formData.startTime && 
    formData.duration &&
    (formData.audienceType === "ALL" || 
     (formData.audienceType === "DEPARTMENT" && formData.targetDepartmentIds.length > 0) ||
     (formData.audienceType === "SPECIFIC" && formData.selectedEmployeeIds.length > 0))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Training Session</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Facilitator Name */}
          <div className="space-y-2">
            <Label htmlFor="facilitator">Facilitator Name *</Label>
            <Input
              id="facilitator"
              placeholder="Enter facilitator name"
              value={formData.facilitator}
              onChange={(e) => setFormData(prev => ({ ...prev, facilitator: e.target.value }))}
              required
            />
          </div>

          {/* Training Selection */}
          <div className="space-y-2">
            <Label>Training Selection *</Label>
            <Popover open={trainingOpen} onOpenChange={setTrainingOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={trainingOpen}
                  className="w-full justify-between"
                >
                  {selectedTraining ? selectedTraining.name : "Select training..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search trainings..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    {isTrainingsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading trainings...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No training found.</CommandEmpty>
                        <CommandGroup>
                          {filteredTrainings.map((training) => (
                        <CommandItem
                          key={training.id}
                          value={training.name}
                          onSelect={() => {
                            setSelectedTraining(training)
                            setFormData(prev => ({ 
                              ...prev, 
                              trainingId: training.id,
                              audienceType: training.category,
                              // Reset selections when training changes
                              selectedEmployeeIds: [],
                              targetDepartmentIds: [],
                              selectedDepartments: []
                            }))
                            setTrainingOpen(false)
                            setSearchValue("")
                          }}
                        >
                          {training.name}
                        </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Training Type */}
          <div className="space-y-3">
            <Label>Training Type *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Staff Forum" id="forum" />
                <Label htmlFor="forum">Staff Forum</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Staff Training" id="training" />
                <Label htmlFor="training">Staff Training</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Training Audience */}
          <div className="space-y-3">
            <Label>Training Audience *</Label>
            {selectedTraining ? (
              <div className="p-3 border rounded-md bg-muted/20">
                <p className="text-sm font-medium">
                  {selectedTraining.category === 'ALL' && 'All Employees'}
                  {selectedTraining.category === 'DEPARTMENT' && 'Specific Departments'}
                  {selectedTraining.category === 'SPECIFIC' && 'Specific Employees'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Audience type is determined by the selected training
                </p>
              </div>
            ) : (
              <div className="p-3 border rounded-md bg-muted/10">
                <p className="text-sm text-muted-foreground">
                  Please select a training first to see the target audience
                </p>
              </div>
            )}
          </div>

          {/* Department Selection - Conditional */}
          {formData.audienceType === "DEPARTMENT" && (
            <div className="space-y-2">
              <Label>Select Departments *</Label>
              <DepartmentSelector
                selectedValues={formData.selectedDepartments}
                onSelectionChange={(values) => setFormData(prev => ({ 
                  ...prev, 
                  selectedDepartments: values,
                  targetDepartmentIds: values.map(v => parseInt(v))
                }))}
                departments={getFilteredDepartments()}
                isLoading={isDepartmentsLoading}
              />
              {formData.targetDepartmentIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formData.targetDepartmentIds.length} department{formData.targetDepartmentIds.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Employee Selection - Conditional */}
          {formData.audienceType === "SPECIFIC" && (
            <div className="space-y-2">
              <Label>Select Employees *</Label>
              <EmployeeSelector
                selectedValues={formData.selectedEmployeeIds.map(id => id.toString())}
                onSelectionChange={(values) => setFormData(prev => ({ 
                  ...prev, 
                  selectedEmployeeIds: values.map(v => parseInt(v))
                }))}
                employees={getFilteredEmployees()}
                isLoading={isEmployeesLoading}
              />
              {formData.selectedEmployeeIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {formData.selectedEmployeeIds.length} employee{formData.selectedEmployeeIds.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Training Date */}
          <div className="space-y-2">
            <Label>Training Date *</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      date: date ? date.toISOString().split('T')[0] : "" 
                    }))
                    setDateOpen(false)
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  placeholder="09:00 AM"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 hours, 1.5 hours"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                required
              />
            </div>
          </div>

          </form>
        </div>
        
        {/* Create Training Button - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setOpen(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Training'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
