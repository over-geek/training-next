"use client"

import { TrainingEffectivenessTab } from "@/components/training-effectiveness/training-effectiveness-tab"

export default function TrainingEffectivenessPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold">Training Effectiveness</h1>
      </div>
      <TrainingEffectivenessTab />
    </div>
  )
}