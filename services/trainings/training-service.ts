import { api } from '@/lib/auth-service';
import type { Training, TrainingSession, CreateTrainingSessionRequest, UpdateTrainingSessionRequest, AttendanceResponse, TrainingMetrics, UncompletedTraining, ActivityLog, DashboardMetrics, QRCodeData, EvaluationTokenVerification, EvaluationResponse } from './types';

export class TrainingService {
  static async getTrainings(): Promise<Training[]> {
    try {
      const response = await api.get<Training[]>('/trainings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
      throw error;
    }
  }

  static async getTrainingSessions(): Promise<TrainingSession[]> {
    try {
      const response = await api.get<TrainingSession[]>('/training-sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch training sessions:', error);
      throw error;
    }
  }

  static async getTrainingSessionById(id: number): Promise<TrainingSession> {
    try {
      const response = await api.get<TrainingSession>(`/training-sessions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error);
      throw error;
    }
  }

  static async createTrainingSession(trainingData: CreateTrainingSessionRequest): Promise<TrainingSession> {
    try {
      const response = await api.post<TrainingSession>('/training-sessions', trainingData);
      return response.data;
    } catch (error) {
      console.error('Failed to create training session:', error);
      throw error;
    }
  }

  static async updateTrainingSession(trainingData: UpdateTrainingSessionRequest): Promise<TrainingSession> {
    try {
      const response = await api.patch<TrainingSession>(`/training-sessions/${trainingData.id}/status`, trainingData);
      return response.data;
    } catch (error: any) {
      if (error?.status === 405) {
        try {
          console.log('PATCH not supported, trying POST method...');
          const response = await api.post<TrainingSession>(`/training-sessions/${trainingData.id}/update`, trainingData);
          return response.data;
        } catch (postError) {
          console.error(`Failed to update training session ${trainingData.id} with POST:`, postError);
          throw postError;
        }
      }
      console.error(`Failed to update training session ${trainingData.id}:`, error);
      throw error;
    }
  }

  static async deleteTrainingSession(id: number): Promise<void> {
    try {
      await api.delete(`/training-sessions/${id}`);
    } catch (error) {
      console.error(`Failed to delete training session ${id}:`, error);
      throw error;
    }
  }

  static async getAttendanceLogs(trainingId: number): Promise<AttendanceResponse> {
    try {
      const response = await api.get<AttendanceResponse>(`/attendance/logs/${trainingId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch attendance logs for training ${trainingId}:`, error);
      throw error;
    }
  }

  static async getTrainingResponses(trainingId: number): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`/training-sessions/${trainingId}/responses`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch training responses for training ${trainingId}:`, error);
      throw error;
    }
  }

  static async getTrainingMetrics(agendaName: string): Promise<TrainingMetrics> {
    try {
      const response = await api.get<TrainingMetrics>(`/metrics/training?agenda=${encodeURIComponent(agendaName)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch training metrics for agenda ${agendaName}:`, error);
      throw error;
    }
  }

  static async startTrainingSession(trainingId: number): Promise<void> {
    try {
      await api.post(`/card-reader/start-session/${trainingId}`);
    } catch (error) {
      console.error(`Failed to start training session ${trainingId}:`, error);
      throw error;
    }
  }

  static async endTrainingSession(trainingId: number): Promise<void> {
    try {
      await api.post(`/card-reader/end-session/${trainingId}`);
    } catch (error) {
      console.error(`Failed to end training session ${trainingId}:`, error);
      throw error;
    }
  }

  static async getUncompletedTrainings(): Promise<UncompletedTraining[]> {
    try {
      const response = await api.get<UncompletedTraining[]>('/trainings/uncompleted');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch uncompleted trainings:', error);
      throw error;
    }
  }

  static async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const response = await api.get<ActivityLog[]>('/activity_logs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      throw error;
    }
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get<DashboardMetrics>('/metrics/dashboard-summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  }

  static async exportAttendanceLogsPDF(trainingId: number): Promise<void> {
    try {
      const response = await api.get(`/attendance/logs/${trainingId}/pdf`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-logs-training-${trainingId}.pdf`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Failed to export attendance logs for training ${trainingId}:`, error);
      throw error;
    }
  }

  static async exportResponsesZIP(trainingId: number): Promise<void> {
    try {
      const response = await api.get(`/evaluation/logs/${trainingId}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evaluation-responses-training-${trainingId}.zip`;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Failed to export responses for training ${trainingId}:`, error);
      throw error;
    }
  }

  static async generateQRCode(trainingId: number): Promise<QRCodeData> {
    try {
      const response = await api.post<QRCodeData>(`/qr/generate?trainingId=${trainingId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to generate QR code for training ${trainingId}:`, error);
      throw error;
    }
  }

  static async verifyEvaluationToken(token: string): Promise<EvaluationTokenVerification> {
    try {
      const response = await api.get<EvaluationTokenVerification>(`/evaluation/verify-token/${token}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to verify evaluation token ${token}:`, error);
      throw error;
    }
  }

  static async submitEvaluation(evaluationData: EvaluationResponse): Promise<void> {
    try {
      await api.post('/evaluation/submit', evaluationData);
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      throw error;
    }
  }
}
