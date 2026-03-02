// Central registry of all TanStack Query keys.
// Always use these constants to ensure invalidateQueries is consistent.
export const queryKeys = {
  dashboardMetrics: ['dashboard-metrics'] as const,
  activityLogs: ['activity-logs'] as const,
  trainings: ['trainings'] as const,
  trainingSessions: ['training-sessions'] as const,
  trainingSessionById: (id: number) => ['training-sessions', id] as const,
  attendanceLogs: (trainingId: number) => ['attendance-logs', trainingId] as const,
  trainingResponses: (trainingId: number) => ['training-responses', trainingId] as const,
  trainingMetrics: (agendaName: string) => ['training-metrics', agendaName] as const,
  uncompletedTrainings: ['uncompleted-trainings'] as const,
  employees: ['employees'] as const,
  employeeById: (id: number) => ['employees', id] as const,
  departments: ['departments'] as const,
  tee: ['tee'] as const,
  publicEvaluation: (token: string) => ['public-evaluation', token] as const,
} as const;