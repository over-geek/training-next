import { toast } from 'sonner'
import { OAUTH_BASE_URL } from './api-config';

export interface WebSocketMessage {
  type: 'ATTENDANCE' | 'ERROR' | 'PING' | 'PONG';
  data?: {
    name: string;
    department: string;
  };
  message?: string;
}

export interface AttendanceData {
  employeeName: string;
  employeeDepartment: string;
  createdOn: string;
}

type WebSocketEventCallback = (data: AttendanceData) => void;
type WebSocketErrorCallback = (message: string) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private trainingId: string | null = null;
  
  private onAttendanceUpdate: WebSocketEventCallback | null = null;
  private onError: WebSocketErrorCallback | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.disconnect());
    }
  }

  connect(trainingId: string, onAttendance: WebSocketEventCallback, onError: WebSocketErrorCallback): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.trainingId = trainingId;
    this.onAttendanceUpdate = onAttendance;
    this.onError = onError;

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.ws = new WebSocket(`wss://${OAUTH_BASE_URL}/ws?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.send({
          type: 'PING',
        });
        this.startHeartbeat();
        
        toast.success('Connected to real-time attendance system');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        this.stopHeartbeat();
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Attempting to reconnect...');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.onError?.('Failed to connect to attendance system');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'ATTENDANCE':
        if (message.data) {
          const attendanceData: AttendanceData = {
            employeeName: message.data.name,
            employeeDepartment: message.data.department,
            createdOn: new Date().toISOString(),
          };
          
          this.onAttendanceUpdate?.(attendanceData);
          
          toast.success(
            `New Attendee: ${attendanceData.employeeName}`,
            {
              description: `${attendanceData.employeeDepartment} department`,
            }
          );
        }
        break;
        
      case 'ERROR':
        this.onError?.(message.message || 'Unknown error occurred');
        toast.error('Attendance Error', {
          description: message.message || 'Unknown error occurred',
        });
        break;
        
      case 'PONG':
        break;
        
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING' });
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.trainingId && this.onAttendanceUpdate && this.onError) {
        this.connect(this.trainingId, this.onAttendanceUpdate, this.onError);
      }
    }, this.reconnectDelay);
  }

  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      return token.replace('Bearer ', '');
    }
    return null;
  }

  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.trainingId = null;
    this.onAttendanceUpdate = null;
    this.onError = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const webSocketService = new WebSocketService();

