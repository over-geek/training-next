import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrainingService } from "@/services/trainings/training-service";
import type { CreateTrainingSessionRequest, UpdateTrainingSessionRequest, EvaluationResponse, CreateTrainingRequest, UpdateTrainingRequest } from "@/services/trainings/types";
import { queryKeys } from "./query-keys";
export function useTrainings() {
  return useQuery({
    queryKey: queryKeys.trainings,
    queryFn: () => TrainingService.getTrainings(),
  });
}
export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTrainingRequest) => TrainingService.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings });
    },
  });
}
export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTrainingRequest) => TrainingService.updateTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings });
    },
  });
}
export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => TrainingService.deleteTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings });
    },
  });
}
export function useTrainingSessions() {
  return useQuery({
    queryKey: queryKeys.trainingSessions,
    queryFn: () => TrainingService.getTrainingSessions(),
  });
}
export function useTrainingSessionById(id: number) {
  return useQuery({
    queryKey: queryKeys.trainingSessionById(id),
    queryFn: () => TrainingService.getTrainingSessionById(id),
    enabled: !!id,
  });
}
export function useAttendanceLogs(trainingId: number) {
  return useQuery({
    queryKey: queryKeys.attendanceLogs(trainingId),
    queryFn: () => TrainingService.getAttendanceLogs(trainingId),
    enabled: !!trainingId,
  });
}
export function useTrainingResponses(trainingId: number) {
  return useQuery({
    queryKey: queryKeys.trainingResponses(trainingId),
    queryFn: () => TrainingService.getTrainingResponses(trainingId),
    enabled: !!trainingId,
  });
}
export function useTrainingMetrics(agendaName: string) {
  return useQuery({
    queryKey: queryKeys.trainingMetrics(agendaName),
    queryFn: () => TrainingService.getTrainingMetrics(agendaName),
    enabled: !!agendaName,
  });
}
export function useUncompletedTrainings() {
  return useQuery({
    queryKey: queryKeys.uncompletedTrainings,
    queryFn: () => TrainingService.getUncompletedTrainings(),
  });
}
export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTrainingSessionRequest) => TrainingService.createTrainingSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessions });
    },
  });
}
export function useUpdateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTrainingSessionRequest) => TrainingService.updateTrainingSession(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessionById(variables.id) });
    },
  });
}
export function useDeleteTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => TrainingService.deleteTrainingSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
    },
  });
}
export function useStartTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trainingId: number) => TrainingService.startTrainingSession(trainingId),
    onSuccess: (_data, trainingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessionById(trainingId) });
    },
  });
}
export function useEndTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trainingId: number) => TrainingService.endTrainingSession(trainingId),
    onSuccess: (_data, trainingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingSessionById(trainingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
    },
  });
}
export function useSubmitEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EvaluationResponse) => TrainingService.submitEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tee });
    },
  });
}