import { api } from '@/lib/auth-service';

// Types for public evaluation API responses
export interface EvaluationData {
  evaluation: {
    id: number;
    trainingSessionId: number;
    trainingSessionName: string;
    trainingSessionDate: string;
    managerId: number;
    managerName: string;
    milestone: string;
    status: string;
    departmentId: number;
    departmentName: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
  employees: EmployeeEvaluation[];
}

export interface EmployeeEvaluation {
  id: number;
  trainingEffectivenessEvalId: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  productivityComments: string | null;
  attitudeComments: string | null;
  contributionComments: string | null;
  effectivenessRating: number | null;
  dateCreated: string;
  dateOfEval: string | null;
  reviewDate: string | null;
}

export interface EvaluationSubmission {
  token: string;
  evaluations: {
    employeeId: number;
    effectivenessRating: number;
    productivityComments: string;
    attitudeComments: string;
    contributionComments: string;
  }[];
}

export class PublicEvaluationService {
  static async getEvaluationByToken(token: string): Promise<EvaluationData> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/evaluation/${token}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch evaluation data:', error);
      throw error;
    }
  }

  static async submitEvaluation(token: string, evaluationData: EvaluationSubmission): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/evaluation/submit?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      throw error;
    }
  }
}