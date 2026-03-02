import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AuthService } from "./auth-service";
import { WEBSOCKET_BASE_URL } from "./api-config";
import { toast } from "sonner";
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
interface AuthSlice {
  user: AppUser | null;
  isAuthenticated: boolean;
  setUser: (user: AppUser) => void;
  clearUser: () => void;
}
export interface AttendanceData {
  employeeName: string;
  employeeDepartment: string;
  createdOn: string;
}
type AttendanceCallback = (data: AttendanceData) => void;
type WsErrorCallback = (message: string) => void;
interface WsSlice {
  wsInstance: WebSocket | null;
  wsConnected: boolean;
  connectWs: (trainingId: string, onAttendance: AttendanceCallback, onError: WsErrorCallback) => void;
  disconnectWs: () => void;
}
interface SessionSlice {
  machineId: string | null;
  setMachineId: (id: string | null) => void;
}
type AppStore = AuthSlice & WsSlice & SessionSlice;
export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: AuthService.isAuthenticated(),
      setUser: (user) => set({ user, isAuthenticated: true }, false, "setUser"),
      clearUser: () => {
        AuthService.clearAuth();
        set({ user: null, isAuthenticated: false }, false, "clearUser");
      },
      // WebSocket
      wsInstance: null,
      wsConnected: false,
      connectWs: (trainingId, onAttendance, onError) => {
        const existing = get().wsInstance;
        if (existing?.readyState === WebSocket.OPEN) return;
        const token =
          typeof window !== "undefined"
            ? (localStorage.getItem("auth_token") || "").replace("Bearer ", "")
            : null;
        if (!token) {
          onError("No authentication token found");
          return;
        }
        const machineId = get().machineId ?? (typeof window !== "undefined" ? localStorage.getItem("local_machine_id") : null);
        const machineParam = machineId ? `&machineId=${encodeURIComponent(machineId)}` : "";
        const ws = new WebSocket(`wss://${WEBSOCKET_BASE_URL}/ws?token=${token}${machineParam}`);
        let heartbeat: ReturnType<typeof setInterval> | null = null;
        ws.onopen = () => {
          set({ wsInstance: ws, wsConnected: true }, false, "ws/open");
          if (machineId) ws.send(JSON.stringify({ type: "REGISTER", machineId }));
          ws.send(JSON.stringify({ type: "PING" }));
          heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "PING" }));
          }, 15000);
          toast.success("Connected to real-time attendance system");
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string);
            if (msg.type === "ATTENDANCE" && msg.data) {
              const attendance: AttendanceData = {
                employeeName: msg.data.name,
                employeeDepartment: msg.data.department,
                createdOn: new Date().toISOString(),
              };
              onAttendance(attendance);
              toast.success(`New Attendee: ${attendance.employeeName}`, {
                description: `${attendance.employeeDepartment} department`,
              });
            } else if (msg.type === "ERROR") {
              onError(msg.message ?? "Unknown WebSocket error");
              toast.error("Attendance Error", { description: msg.message });
            }
          } catch {
            // ignore parse errors
          }
        };
        ws.onclose = (event) => {
          if (heartbeat) clearInterval(heartbeat);
          set({ wsInstance: null, wsConnected: false }, false, "ws/close");
          if (event.code !== 1000) {
            const attempts = (ws as any).__reconnectAttempts ?? 0;
            if (attempts < 5) {
              (ws as any).__reconnectAttempts = attempts + 1;
              setTimeout(() => get().connectWs(trainingId, onAttendance, onError), 3000);
            }
          }
        };
        ws.onerror = () => {
          toast.error("Connection error. Attempting to reconnect...");
        };
        set({ wsInstance: ws }, false, "ws/connecting");
      },
      disconnectWs: () => {
        const ws = get().wsInstance;
        if (ws) ws.close(1000, "Manual disconnect");
        set({ wsInstance: null, wsConnected: false }, false, "ws/disconnect");
      },
      // Session / Machine
      machineId: null,
      setMachineId: (id) => set({ machineId: id }, false, "setMachineId"),
    }),
    { name: "AppStore" }
  )
);