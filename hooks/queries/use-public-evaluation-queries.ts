import { useQuery, useMutation } from "@tanstack/react-query";
import { PublicEvaluationService } from "@/services/public-evaluation-service";
import type { EvaluationSubmission } from "@/services/public-evaluation-service";
import { queryKeys } from "./query-keys";
export function usePublicEvaluation(token: string) {
  return useQuery({
    queryKey: queryKeys.publicEvaluation(token),
    queryFn: () => PublicEvaluationService.getEvaluationByToken(token),
    enabled: !!token,
  });
}
export function useSubmitPublicEvaluation() {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: EvaluationSubmission }) =>
      PublicEvaluationService.submitEvaluation(token, data),
  });
}