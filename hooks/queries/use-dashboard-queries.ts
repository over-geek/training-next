import { useQuery } from "@tanstack/react-query";
import { TrainingService } from "@/services/trainings/training-service";
import { queryKeys } from "./query-keys";
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics,
    queryFn: () => TrainingService.getDashboardMetrics(),
  });
}
export function useActivityLogs() {
  return useQuery({
    queryKey: queryKeys.activityLogs,
    queryFn: () => TrainingService.getActivityLogs(),
  });
}