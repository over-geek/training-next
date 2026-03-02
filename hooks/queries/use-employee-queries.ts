import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeService } from "@/services/employees/employee-service";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/services/employees/types";
import { queryKeys } from "./query-keys";
export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => EmployeeService.getEmployees(),
  });
}
export function useEmployeeById(id: number) {
  return useQuery({
    queryKey: queryKeys.employeeById(id),
    queryFn: () => EmployeeService.getEmployeeById(id),
    enabled: !!id,
  });
}
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => EmployeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => EmployeeService.updateEmployee(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeById(variables.id) });
    },
  });
}
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => EmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}
export function useRevokeEmployeeAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => EmployeeService.revokeEmployeeAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}
export function useToggleEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => EmployeeService.toggleEmployeeStatus(id),
    onSuccess: (updatedEmployee, id) => {
      // Immediately update the cached list so the UI reflects the new status
      // without waiting for a background refetch.
      queryClient.setQueryData<import("@/services/employees/types").Employee[]>(
        queryKeys.employees,
        (old) =>
          old?.map((emp) =>
            emp.id === id ? { ...emp, status: updatedEmployee.status } : emp
          ) ?? old
      );
      // Still invalidate so the data eventually syncs with the server.
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}
export function useUpdateEmployeeCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cardData }: { id: number; cardData?: unknown }) =>
      EmployeeService.updateEmployeeCard(id, cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}