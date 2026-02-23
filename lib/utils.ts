import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const MACHINE_ID_KEY = 'machine_id';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function initMachineId() {
    try {
        const response = await fetch('http://localhost:5174/machine-id');
        const data = await response.json();
        
        localStorage.setItem('local_machine_id', data.machineId);
        
        return data.machineId;
    } catch (error) {
        console.error("Local Bridge Service not detected.");
        return null;
    }
}