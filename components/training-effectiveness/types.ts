export type EvaluationStatus = "pending_manager" | "manager_submitted" | "hr_approved"

export interface TrainingSession {
  id: string
  sessionName: string
  managerName: string
  department: string
  dueDate: string
  status: EvaluationStatus
  scores: {
    knowledge: number
    application: number
    behavior: number
    results: number
  } | null
  comments: string | null
}
