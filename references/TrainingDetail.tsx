"use client"
import { useParams, useLocation } from "react-router-dom"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import StatsCards from "@/components/StatsCards.jsx"

import {useToast} from "@/hooks/use-toast.ts"
import { Separator } from "@/components/ui/separator.tsx"
import { Button } from "@/components/ui/button"
import { Status } from "@/components/ui/status"

import TrainingQrCode from "../../components/EvaluationQRCode.jsx"

import { columns } from "./AttendanceColumns"
import { DataTablePagination } from "../../components/filter_table/tablePagination"
import { Attendance } from "../../components/filter_table/data/type"
import {useEffect, useRef, useState} from "react";
import { fetchEvalResponseLength, fetchTrainingMetrics } from "@/services/utils.js"
import { updateTrainingSessionStatus, startTrainingSession, fetchTrainingSessionById, endTrainingSession } from "@/components/filter_table/data/trainingData"
import LineChart from "@/components/dashboard/LineChart.jsx"
import PieChart from "@/components/dashboard/PieChart.jsx"
import api from "@/services/api.ts"

interface Training {
  id: string;
  trainingName: string;
  facilitator: string;
  status: string;
  departmentNames: string[];
}

interface WebSocketMessage {
  type: 'ATTENDANCE' | 'ERROR';
  data: {
    name: string;
    department: string;
  };
  message?: string;
}

interface AttendanceLog {
  id: string;
  employeeName: string;
  employeeId?: string;
  employeeDepartment: string;
  createdOn: string;
}

interface TrainingMetricData {
  attendeeCount: number[];
  departmentBreakdown: number[];
}

function TrainingDetail() {
    const { id } = useParams()
    const location = useLocation()
    const [training, setTraining] = useState<Training | null>(location.state?.training);
    const [data, setData] = useState<Attendance[]>([])
    const [trainingMetric, setTrainingMetric] = useState<TrainingMetricData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [totalAttendees, setTotalAttendees] = useState<number>(0)
    const [evalResponseLength, setEvalResponseLength] = useState<number>(0)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const websocket = useRef<WebSocket | null>(null)

    const { toast } = useToast()

    useEffect(() => {
      return () => {
        if (websocket.current) {
          websocket.current.close();
          websocket.current = null;
        }
      };
    }, []);

    const connectWebSocket = () => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        return;
      }

      let ws: WebSocket | null = null;
      try {
        const token = localStorage.getItem('token')?.replace('Bearer ', '') || '';
        ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        return;
      }

      if (!ws) return;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          trainingId: id
        }));
        
        // Set up heartbeat
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);

        ws.onclose = () => {
          clearInterval(heartbeat);
          console.log('WebSocket connection closed');
          
          if (training?.status === "in progress") {
            setTimeout(() => connectWebSocket(), 3000);
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'ATTENDANCE') {
            
            const newAttendee: AttendanceLog = {
              id: new Date().toISOString(),
              employeeName: message.data.name,
              employeeDepartment: message.data.department,
              createdOn: new Date().toISOString(),
            };

            setData(prevData => {
              
              const exists = prevData.some(a => a.employeeName === newAttendee.employeeName);
              if (!exists) {
                return [...prevData, newAttendee];
              }
              return prevData;
            });

            setTotalAttendees(prev => prev + 1);
            
            toast({
              title: "New Attendee",
              description: `${newAttendee.employeeName} has joined the training`,
            });
          } else if (message.type === 'ERROR') {
            toast({
              variant: "destructive",
              title: "Error",
              description: message.message,
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to attendance system. Retrying...",
        });
      };

      websocket.current = ws;
    };

    useEffect(() => {
      if (id) {
        const fetchData = async () => {
          try {
            setLoading(true);
            const [trainingData, attendanceResponse] = await Promise.all([
              fetchTrainingSessionById(id),
              api.get(`/api/attendance/logs/${id}`)
            ]);
            
            if (trainingData) {
              setTraining(trainingData);

              if (trainingData.status === "in progress") {
                startTrainingSession(id)
                connectWebSocket();
              }
            }

            const evalResponseLength = await fetchEvalResponseLength(id);
            const logs = attendanceResponse.data.attendees;
            const attendeeData = await fetchTrainingMetrics(training?.trainingName);
            setTrainingMetric(attendeeData);
            setTotalAttendees(logs.length);
            setEvalResponseLength(evalResponseLength);
            setData(logs);
          } catch (error) {
            setError('Failed to load data');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }, [id]);

    const handleStartSession = async () => {
      if (!id) return;
      
      try {
        
        toast({
          description: "Training Session Started",
        });
        
        setTraining((prev: Training | null) => prev ? { ...prev, status: "in progress" } : null);

        connectWebSocket();
        console.log("training id:", id)
        
        const [sessionStarted, response] = await Promise.all([
          startTrainingSession(id),
          updateTrainingSessionStatus(id, "in progress")
        ]);

        if (!sessionStarted || !response) {
          
          setTraining((prev: Training | null) => prev ? { ...prev, status: "upcoming" } : null);
          
          toast({
            variant: "destructive",
            description: "There was a problem starting the training",
            title: "Uh oh! Something went wrong",
          });
        }
        
      } catch (error) {
        console.error("Session start error:", error);
      }
    };

    const handleEndSession = async () => {
      if (!id) return;
      
      // Close WebSocket connection before ending session
      if (websocket.current?.readyState === WebSocket.OPEN) {
          websocket.current.close();
          websocket.current = null;
      }
  
      const [sessionEnded, response] = await Promise.all([
          endTrainingSession(id),
          updateTrainingSessionStatus(id, "done")
      ]);
  
      if (response && sessionEnded) {
          toast({
              description: "Training Session Ended",
          });
          setTraining((prev: Training | null) => prev ? { ...prev, status: response.status } : null);
      } else {
          toast({
              variant: "destructive",
              description: "There was a problem ending the training",
              title: "Uh oh! Something went wrong",
          });
      }
  };

    const downloadPDF = async (trainingId: string) => {
      setIsExporting(true)
      try {
        const response = await api.get(`/api/evaluation/logs/${trainingId}/pdf`, {
          responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: "application/zip" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `responses_training_${trainingId}.zip`);
        document.body.appendChild(link);
        link.click();
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      } catch (error) {
          console.error('Error downloading PDF:', error);
          toast({
              variant: "destructive",
              description: "Failed to export training responses",
              title: "Export failed",
          })
      } finally {
          setIsExporting(false)
      }

  };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: (window.innerWidth > 1600) ? 10 : 5 }
        }
    })

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <div className='border px-6 py-4 bg-gray-100 h-full flex flex-col gap-5'>
          <div className='flex justify-between items-center bg-white px-5 py-3'>
            <div className='flex flex-col'>
              <div className="flex gap-4">
                <div className='flex gap-2'>
                  <p className="font-semibold">Agenda:</p>
                  <p>{training?.trainingName}</p>
                </div>
                <div className='flex gap-2'>
                  <p className="font-semibold">Facilitator:</p>
                  <p>{training?.facilitator}</p>
                </div>
              </div>
              {training?.departmentNames && (
                <div className="flex gap-2">
                  <p className="font-semibold text-red-500">Eligible: </p>
                  <span>{training?.departmentNames.join(", ")}</span>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <TrainingQrCode trainingId={id} status={training?.status} />
              {
                training?.status === "upcoming" && (
                  <Button onClick={handleStartSession} size="sm">
                    {training?.status === "upcoming" ? "Start Session" : "End Session"}
                  </Button>
                )
              }
              {
                training?.status === "in progress" && (
                  <Button onClick={handleEndSession} size="sm">
                    End Session
                  </Button>
                )
              }
              {
                training?.status === "done" && (
                  <Button
                    size="sm"
                    disabled={isExporting}
                    onClick={() => downloadPDF(training?.id)}
                  >
                    {isExporting ? (
                        <>
                            Exporting...
                        </>
                    ) : (
                        'Export responses'
                    )}
                  </Button>
                )
              }
            </div>
          </div>
          <div className="flex gap-5 h-40">
            <div className="flex gap-4 items-end">
              <StatsCards statTitle="Total Attendees" statScore={totalAttendees} />
              <StatsCards statTitle="Total Responses" statScore={evalResponseLength} />
            </div>
            <Separator orientation="vertical" />
            <div className="br-1 bg-white py-3 ring-1 ring-inset ring-gray-100 shadow-sm">
              <LineChart data={trainingMetric} title=" All time attendance rate" />
            </div>
            {
              (trainingMetric?.departmentBreakdown?.length ?? 0) > 0 && (
                <div className="h-full bg-white ring-1 ring-inset ring-gray-100 shadow-sm br-1">
                  <PieChart data={trainingMetric} />
                </div>
              )
            }
          </div>
          <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                {training?.status === "in progress" ? (<Status value="success">Session In Progress</Status>) : "Session not started yet"}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <DataTablePagination table={table} />
          </div>
        </div>
    )
}

export default TrainingDetail