"use client";

import { useEffect } from "react";
import { initMachineId } from "@/lib/machine-id";

export function AppInitializer() {
  useEffect(() => {
    void (async () => {
      await initMachineId();
    })();
  }, []);

  return null;
}