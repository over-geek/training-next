import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Training } from "@/services/trainings/types";

type TrainingManagementStore = {
  searchQuery: string
  isDialogOpen: boolean
  editingTraining: Training | null

  setSearchQuery: (query: string) => void;
  openCreateDialog: () => void;
  openEditDialog: (training: Training) => void;
  closeDialog: () => void;
}

export const useTrainingManagementStore = create<TrainingManagementStore>()(
  devtools(
    (set) => ({
      searchQuery: "",
      isDialogOpen: false,
      editingTraining: null,
      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),
      openCreateDialog: () =>
        set({ isDialogOpen: true, editingTraining: null }, false, "openCreateDialog"),
      openEditDialog: (training) =>
        set({ isDialogOpen: true, editingTraining: training }, false, "openEditDialog"),
      closeDialog: () =>
        set({ isDialogOpen: false, editingTraining: null }, false, "closeDialog"),
    }),
    { name: "TrainingManagementStore" }
  )
);

