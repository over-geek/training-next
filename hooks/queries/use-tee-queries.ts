import { useQuery, useMutation } from "@tanstack/react-query";
import { TrainingEffectivenessEvaluationService } from "@/services/tee/training-effectiveness-evaluation-service";
import { queryKeys } from "./query-keys";
export function useTrainingEffectivenessEvals() {
  return useQuery({
    queryKey: queryKeys.tee,
    queryFn: () => TrainingEffectivenessEvaluationService.getTrainingEffectivenessEval(),
  });
}

export function useResendNudge() {
  return useMutation({
    mutationFn: (evaluationId: string) =>
      TrainingEffectivenessEvaluationService.resendNudge(evaluationId),
  });
}
