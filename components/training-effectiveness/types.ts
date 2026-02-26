export type EvaluationStatus = "PENDING_MANAGER" | "PENDING_SIGNATURES" | "COMPLETED" | "PENDING_HR_BP"

export interface TrainingSession {
  id: string
  sessionName: string
  managerName: string
  department: string
  dueDate: string
  status: EvaluationStatus
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
