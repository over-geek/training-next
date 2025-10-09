export interface TrainingHistory {
  id: number;
  name: string;
  date: string;
}

export interface Employee {
  id: number;
  name?: string;
  department?: string;
  email?: string;
  trainingsAttended: number;
  trainingHistory?: TrainingHistory[];
  status: 'active' | 'inactive';
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  departmentId: number;
}

export interface UpdateEmployeeRequest {
  id: number;
  name?: string;
  email?: string;
  department?: string;
  status?: 'active' | 'inactive';
}
