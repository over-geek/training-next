export type EvaluationStatus = "PENDING_MANAGER" | "PENDING_HR_BP" | "COMPLETED"

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

// API response type
export interface TrainingEffectivenessEvaluation {
  id: number;
  trainingSessionId: number;
  trainingSessionName: string;
  trainingSessionDate: string;
  managerId: number;
  managerName: string;
  milestone: string;
  status: EvaluationStatus;
  departmentId: number;
  departmentName: string;
  createdAt: string;
  updatedAt: string;
}
