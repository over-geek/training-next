import { api } from '@/lib/auth-service';
import type { TrainingEffectivenessEvaluation } from './types';

export class TrainingEffectivenessEvaluationService {
  static async getTrainingEffectivenessEval(): Promise<TrainingEffectivenessEvaluation[]> {
    try {
      const response = await api.get<TrainingEffectivenessEvaluation[]>('/training-effectiveness');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch training effectiveness evaluations:', error);
      throw error;
    }
  }

  static async resendNudge(evaluationId: string): Promise<void> {
    try {
      await api.post(`/training-effectiveness/${evaluationId}/nudge`);
    } catch (error) {
      console.error(`Failed to resend nudge for evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
}