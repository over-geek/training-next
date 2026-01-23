// Types for training effectiveness evaluation API responses

export type EvaluationStatus = "PENDING_MANAGER" | "PENDING_HR_BP" | "COMPLETED";

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