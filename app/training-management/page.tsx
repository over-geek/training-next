"use client"

import React, { useEffect, useState } from "react"
import {Search, Plus, Pencil, Trash2, BookOpen, Loader2, AlertCircle, Users, Building2, Trash2Icon} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

import { useTrainings, useCreateTraining, useUpdateTraining, useDeleteTraining, useDepartments, useEmployees } from "@/hooks/queries"
import { useTrainingManagementStore } from "@/lib/training-management-store"
import type { Training, CreateTrainingRequest } from "@/services/trainings/types"

type TargetAudience = "ALL" | "DEPARTMENT" | "SPECIFIC_EMPLOYEES"

interface SelectableItem {
  id: number
  name: string
}

function CategoryBadge({ category }: { category: Training["category"] }) {
  if (category === "DEPARTMENT") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-xs w-fit">
        <Building2 className="h-3 w-3" />
        Department
      </Badge>
    )
  }
  if (category === "SPECIFIC_EMPLOYEES") {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-xs w-fit">
        <Users className="h-3 w-3" />
        Specific People
      </Badge>
    )
  }
  return (
    <Badge className="flex items-center gap-1 text-xs w-fit">
      <Users className="h-3 w-3" />
      All Employees
    </Badge>
  )
}

function MultiSelectList({
  items,
  selectedIds,
  onToggle,
  placeholder,
  isLoading,
}: {
  items: SelectableItem[]
  selectedIds: number[]
  onToggle: (id: number) => void
  placeholder: string
  isLoading: boolean
}) {
  const [search, setSearch] = useState("")
  const filtered = items.filter((i) =>
    (i.name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border rounded-md p-3 space-y-2">
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-48 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`item-${item.id}`}
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => onToggle(item.id)}
              />
              <label
                htmlFor={`item-${item.id}`}
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                {item.name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface TrainingFormState {
  name: string
  targetAudience: TargetAudience
  selectedDepartmentIds: number[]
  selectedEmployeeIds: number[]
}

function TrainingFormDialog() {
  const { isDialogOpen, editingTraining, closeDialog } = useTrainingManagementStore()
  const isEditing = !!editingTraining

  const { data: departments = [], isLoading: depsLoading } = useDepartments()
  const { data: employees = [], isLoading: empsLoading } = useEmployees()

  const createMutation = useCreateTraining()
  const updateMutation = useUpdateTraining()

  const [form, setForm] = useState<TrainingFormState>({
    name: "",
    targetAudience: "ALL",
    selectedDepartmentIds: [],
    selectedEmployeeIds: [],
  })

  useEffect(() => {
    if (isDialogOpen) {
      if (editingTraining) {
        const audience = editingTraining.category as TargetAudience
        const ids = (editingTraining.requiredFor ?? []).map((r) => r.id)
        setForm({
          name: editingTraining.name,
          targetAudience: audience,
          selectedDepartmentIds: audience === "DEPARTMENT" ? ids : [],
          selectedEmployeeIds: audience === "SPECIFIC_EMPLOYEES" ? ids : [],
        })
      } else {
        setForm({ name: "", targetAudience: "ALL", selectedDepartmentIds: [], selectedEmployeeIds: [] })
      }
    }
  }, [editingTraining, isDialogOpen])

  const toggleDept = (id: number) =>
    setForm((prev) => ({
      ...prev,
      selectedDepartmentIds: prev.selectedDepartmentIds.includes(id)
        ? prev.selectedDepartmentIds.filter((x) => x !== id)
        : [...prev.selectedDepartmentIds, id],
    }))

  const toggleEmp = (id: number) =>
    setForm((prev) => ({
      ...prev,
      selectedEmployeeIds: prev.selectedEmployeeIds.includes(id)
        ? prev.selectedEmployeeIds.filter((x) => x !== id)
        : [...prev.selectedEmployeeIds, id],
    }))

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      toast.error("Training name is required.")
      return
    }

    let requiredFor: number[] = []
    if (form.targetAudience === "DEPARTMENT") requiredFor = form.selectedDepartmentIds
    else if (form.targetAudience === "SPECIFIC_EMPLOYEES") requiredFor = form.selectedEmployeeIds

    const payload: CreateTrainingRequest = {
      name: trimmedName,
      category: form.targetAudience,
      requiredFor,
    }

    try {
      if (isEditing && editingTraining) {
        await updateMutation.mutateAsync({ id: editingTraining.id, ...payload })
        toast.success("Training updated successfully!")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Training created successfully!")
      }
      closeDialog()
    } catch {
      toast.error(isEditing ? "Failed to update training." : "Failed to create training.")
    }
  }

  const departmentItems: SelectableItem[] = departments.map((d) => ({ id: d.id, name: d.name }))
  const employeeItems: SelectableItem[] = employees.map((e) => ({ id: e.id, name: e.name ?? `Employee #${e.id}` }))

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Training" : "Create Training"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Training Name */}
          <div className="space-y-1.5">
            <Label htmlFor="training-name">Training Name</Label>
            <Input
              id="training-name"
              placeholder="Enter training name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <RadioGroup
              value={form.targetAudience}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  targetAudience: val as TargetAudience,
                  selectedDepartmentIds: [],
                  selectedEmployeeIds: [],
                }))
              }
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ALL" id="audience-all" />
                <Label htmlFor="audience-all" className="cursor-pointer font-normal">All Employees</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEPARTMENT" id="audience-dept" />
                <Label htmlFor="audience-dept" className="cursor-pointer font-normal">Department</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SPECIFIC_EMPLOYEES" id="audience-specific" />
                <Label htmlFor="audience-specific" className="cursor-pointer font-normal">Specific People</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional: Department Selector */}
          {form.targetAudience === "DEPARTMENT" && (
            <div className="space-y-1.5">
              <Label>Select Departments</Label>
              <MultiSelectList
                items={departmentItems}
                selectedIds={form.selectedDepartmentIds}
                onToggle={toggleDept}
                placeholder="Search departments..."
                isLoading={depsLoading}
              />
              {form.selectedDepartmentIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {form.selectedDepartmentIds.length} department(s) selected
                </p>
              )}
            </div>
          )}

          {/* Conditional: Employee Selector */}
          {form.targetAudience === "SPECIFIC_EMPLOYEES" && (
            <div className="space-y-1.5">
              <Label>Select Employees</Label>
              <MultiSelectList
                items={employeeItems}
                selectedIds={form.selectedEmployeeIds}
                onToggle={toggleEmp}
                placeholder="Search employees..."
                isLoading={empsLoading}
              />
              {form.selectedEmployeeIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {form.selectedEmployeeIds.length} employee(s) selected
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? "Save Changes" : "Create Training"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TrainingCard({ training }: { training: Training }) {
  const { openEditDialog } = useTrainingManagementStore()
  const deleteMutation = useDeleteTraining()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(training.id)
      toast.success("Training deleted successfully!")
    } catch {
      toast.error("Failed to delete training.")
    } finally {
      setDeleteOpen(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-shrink-0 h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {training.name}
            </CardTitle>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => openEditDialog(training)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                      <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash2Icon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this training.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</>
                    ) : (
                        "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CategoryBadge category={training.category} />
        </CardContent>
      </Card>
    </>
  )
}

function TrainingCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-2 pb-2">
        <Skeleton className="h-9 w-9 rounded-md flex-shrink-0" />
        <Skeleton className="h-5 flex-1 rounded mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-28 rounded-full" />
      </CardContent>
    </Card>
  )
}

export default function TrainingManagementPage() {
  const { searchQuery, setSearchQuery, openCreateDialog } = useTrainingManagementStore()
  const { data: trainings = [], isLoading, isError } = useTrainings()

  const filtered = trainings.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Training Management</h1>
        <p className="text-muted-foreground text-sm">View, search, and manage all training programmes.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Training
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrainingCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-medium">Failed to load trainings</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            {searchQuery ? "No trainings match your search" : "No trainings found"}
          </p>
          {!searchQuery && (
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first training
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((training) => (
            <TrainingCard key={training.id} training={training} />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <TrainingFormDialog />
    </div>
  )
}

