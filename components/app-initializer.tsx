"use client";

import { useEffect } from "react";
import { initMachineId } from "@/lib/machine-id";
import { useAppStore } from "@/lib/store";

export function AppInitializer() {
  const setMachineId = useAppStore((s) => s.setMachineId);

  useEffect(() => {
    void (async () => {
      const id = await initMachineId();
      if (id) setMachineId(id);
    })();
  }, [setMachineId]);

  return null;
}