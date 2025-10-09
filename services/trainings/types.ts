// Types for training session related API responses

export interface Training {
  id: number;
  name: string;
  category: 'ALL' | 'DEPARTMENT' | 'SPECIFIC';
  requiredFor: {
    id: number;
    name: string;
  }[];
  totalRequired: number;
  completed: number;
}

export interface TrainingSession {
  id: number;
  trainingName: string;
  facilitator: string;
  date: string; 
  startTime: string;
  trainingType: string;
  status: 'upcoming' | 'in-progress' | 'done';
  duration: string;
  audienceType: 'ALL' | 'DEPARTMENT' | 'SPECIFIC';
  departmentNames: string[] | null;
}

export interface CreateTrainingSessionRequest {
  trainingId: number;
  facilitator: string;
  duration: string;
  startTime: string;
  type: string;
  date: string;
  audienceType: 'ALL' | 'DEPARTMENT' | 'SPECIFIC';
  selectedEmployeeIds: number[];
  targetDepartmentIds: number[];
}

export interface UpdateTrainingSessionRequest {
  id: number;
  trainingName?: string;
  facilitator?: string;
  date?: string;
  startTime?: string;
  trainingType?: string;
  status?: 'upcoming' | 'in-progress' | 'done';
  duration?: string;
  audienceType?: 'ALL' | 'DEPARTMENT' | 'SPECIFIC';
  departmentNames?: string[];
}

export interface AttendanceLog {
  employeeName: string;
  employeeDepartment: string;
  createdOn: string;
}

export interface AttendanceResponse {
  trainingName: string;
  trainingType: string;
  trainingDate: string;
  facilitator: string;
  attendees: AttendanceLog[];
  startTime: string;
  duration: string;
}

export interface TrainingMetrics {
  attendeeCount: number[];
  departmentBreakdown: number[];
  departmentNames: string[];
  attendeeDates: string[];
}

export interface MissingEmployee {
  id: number;
  name: string;
  department: string;
}

export interface UncompletedTraining {
  id: number;
  name: string;
  category: string;
  requiredFor: string[];
  totalRequired: number;
  completed: number;
  completionRate: number;
  missingEmployees: MissingEmployee[];
}

export interface ActivityLog {
  type: 'training_ended' | 'training_started' | 'training_created' | 'card_updated' | 'attendee_created' | 'access_revoked' | 'evaluation_submitted';
  message: string;
  timestamp: string;
  comment: string | null;
}

export interface TrainingAttendance {
  trainingName: string;
  trainingType: string;
  attendeeCount: number;
}

export interface DashboardMetrics {
  totalCompletedTrainings: number;
  averageAttendees: number;
  averageResponses: number;
  upcomingTrainings: number;
  twelveMonths: {
    monthlyTrainings: number[];
    monthlyAttendees: number[];
    monthlyResponses: number[];
  };
  ratings: number[];
  highestAttendance: TrainingAttendance[];
  lowestAttendance: TrainingAttendance;
}

export interface QRCodeData {
  qrImage: string;
  qrUrl: string;
}

export interface EvaluationTokenVerification {
  valid: boolean;
  trainingId?: number;
  trainingName?: string;
  message?: string;
}

export interface EvaluationResponse {
  token: string;
  response: number;
  response2: number;
  response3: number;
  response4: number;
  response5: number;
  response6: number;
  response7: number;
  response8: number;
  response9: number;
  additionalComment: string;
}