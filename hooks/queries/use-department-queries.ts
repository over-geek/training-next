import { useQuery } from "@tanstack/react-query";
import { DepartmentService } from "@/services/departments/department-service";
import { queryKeys } from "./query-keys";
export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => DepartmentService.getDepartments(),
  });
}