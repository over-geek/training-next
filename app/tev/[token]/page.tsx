"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CheckCircle, AlertCircle, Calendar, Users, Building2 } from "lucide-react"
import { toast } from "sonner"
import { PublicEvaluationService, EvaluationData, EmployeeEvaluation, EvaluationSubmission } from "@/services/public-evaluation-service"

// Types imported from service

// Rating input will accept positive integers 1-10

export default function ManagerEvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [employeeEvaluations, setEmployeeEvaluations] = useState<Record<number, {
    effectivenessRating: number
    productivityComments: string
    attitudeComments: string
    contributionComments: string
  }>>({})

  useEffect(() => {
    if (token) {
      fetchEvaluationData()
    }
  }, [token])

  const fetchEvaluationData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await PublicEvaluationService.getEvaluationByToken(token)
      setEvaluationData(data)

      // Initialize form state for each employee
      const initialEvaluations: Record<number, any> = {}
      data.employees.forEach(employee => {
        initialEvaluations[employee.employeeId] = {
          effectivenessRating: employee.effectivenessRating || '',
          productivityComments: employee.productivityComments || '',
          attitudeComments: employee.attitudeComments || '',
          contributionComments: employee.contributionComments || ''
        }
      })
      setEmployeeEvaluations(initialEvaluations)

    } catch (error) {
      console.error('Failed to fetch evaluation data:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmployeeEvaluation = (employeeId: number, field: string, value: any) => {
    setEmployeeEvaluations(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }))
  }

  const getProgress = () => {
    if (!evaluationData) return 0
    const completedEvaluations = Object.values(employeeEvaluations).filter(
      evaluation => evaluation.effectivenessRating >= 1 && evaluation.effectivenessRating <= 10 &&
                     evaluation.productivityComments.trim() &&
                     evaluation.attitudeComments.trim() &&
                     evaluation.contributionComments.trim()
    ).length
    return (completedEvaluations / evaluationData.employees.length) * 100
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const submissionData: EvaluationSubmission = {
        token,
        evaluations: Object.entries(employeeEvaluations).map(([employeeId, evaluation]) => ({
          employeeId: parseInt(employeeId),
          effectivenessRating: evaluation.effectivenessRating,
          productivityComments: evaluation.productivityComments,
          attitudeComments: evaluation.attitudeComments,
          contributionComments: evaluation.contributionComments
        }))
      }

      await PublicEvaluationService.submitEvaluation(token, submissionData)

      setIsSubmitted(true)
      toast.success('Thank you! Your team evaluation has been submitted successfully.')

    } catch (error) {
      console.error('Failed to submit evaluation:', error)
      toast.error('Failed to submit evaluation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return Object.values(employeeEvaluations).every(
      evaluation => evaluation.effectivenessRating >= 1 && evaluation.effectivenessRating <= 10 &&
                     evaluation.productivityComments.trim() &&
                     evaluation.attitudeComments.trim() &&
                     evaluation.contributionComments.trim()
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h2 className="text-lg font-semibold mb-2">Loading Evaluation</h2>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we load your team evaluation...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Evaluation Unavailable</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {error}
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Evaluation Submitted!</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Thank you for completing the training effectiveness evaluation.
              Your feedback helps us measure the impact of our training programs.
            </p>
            <Button onClick={() => router.push('/')}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!evaluationData) return null

  const progress = getProgress()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(progress)}% Complete
              </p>
            </div>
            <CardTitle className="text-2xl text-center">Training Effectiveness Evaluation</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{evaluationData.evaluation.trainingSessionName}</p>
                  <p className="text-muted-foreground">
                    {new Date(evaluationData.evaluation.trainingSessionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{evaluationData.evaluation.managerName}</p>
                  <p className="text-muted-foreground">Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{evaluationData.evaluation.departmentName}</p>
                  <p className="text-muted-foreground">{evaluationData.evaluation.milestone.replace('_', ' ')} Review</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Employee Evaluation Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-64 font-semibold text-center">Employee</TableHead>
                  <TableHead className="font-semibold text-center">Productivity Impact</TableHead>
                  <TableHead className="font-semibold text-center">Attitude & Engagement</TableHead>
                  <TableHead className="font-semibold text-center">Team Contribution</TableHead>
                  <TableHead className="w-32 font-semibold text-center">Rating (1-10)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationData.employees.map((employee, index) => {
                  const evaluation = employeeEvaluations[employee.employeeId] || {
                    effectivenessRating: '',
                    productivityComments: '',
                    attitudeComments: '',
                    contributionComments: ''
                  }

                  return (
                    <TableRow key={employee.id} className="align-top">
                      <TableCell className="font-medium w-1/5 text-center">
                        <p className="text-sm text-muted-foreground">{employee.employeeName}</p>
                      </TableCell>

                      <TableCell className="w-1/5">
                        <Textarea
                          value={evaluation.productivityComments}
                          onChange={(e) => updateEmployeeEvaluation(employee.employeeId, 'productivityComments', e.target.value)}
                          placeholder="Employee's productivity after training?"
                          className="min-h-[80px] resize-none"
                        />
                      </TableCell>

                      <TableCell className="w-1/5">
                        <Textarea
                          value={evaluation.attitudeComments}
                          onChange={(e) => updateEmployeeEvaluation(employee.employeeId, 'attitudeComments', e.target.value)}
                          placeholder="Employee's attitude after training?"
                          className="min-h-[80px] resize-none"
                        />
                      </TableCell>

                      <TableCell className="w-1/5">
                        <Textarea
                          value={evaluation.contributionComments}
                          onChange={(e) => updateEmployeeEvaluation(employee.employeeId, 'contributionComments', e.target.value)}
                          placeholder="Employee's contribution to team objectives after training?"
                          className="min-h-[80px] resize-none"
                        />
                      </TableCell>

                      <TableCell className="w-1/5">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={evaluation.effectivenessRating || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 10) {
                              updateEmployeeEvaluation(employee.employeeId, 'effectivenessRating', value);
                            }
                          }}
                          placeholder="1-10"
                          className="w-16 text-center"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please ensure all evaluations are complete before submitting.
                This action cannot be undone.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                size="lg"
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Evaluation...
                  </>
                ) : (
                  'Submit All Evaluations'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}