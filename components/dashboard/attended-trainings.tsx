"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface AttendedTraining {
  trainingName: string;
  trainingType: string;
  attendeeCount: number;
}

interface AttendedTrainingsProps {
  mostAttended: AttendedTraining | null;
  leastAttended: AttendedTraining | null;
}

export default function AttendedTrainings({ mostAttended, leastAttended }: AttendedTrainingsProps) {
  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex-1"
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Attended Trainings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[calc(100%-60px)]">
            <div className="text-center">
              {mostAttended ? (
                <>
                  <div className="text-lg font-semibold mb-1">{mostAttended.trainingName}</div>
                  <div className="text-2xl font-bold text-primary">{mostAttended.attendeeCount}</div>
                  <div className="text-xs text-muted-foreground">attendees</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="flex-1"
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Least Attended Training</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[calc(100%-60px)]">
            <div className="text-center">
              {leastAttended ? (
                <>
                  <div className="text-lg font-semibold mb-1">{leastAttended.trainingName}</div>
                  <div className="text-2xl font-bold text-orange-600">{leastAttended.attendeeCount}</div>
                  <div className="text-xs text-muted-foreground">attendees</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
