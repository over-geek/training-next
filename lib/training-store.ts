export interface Training {
  id: number;
  date: string;
  name: string;
  facilitator: string;
  type: string;
  audience: string;
  duration: string;
  time: string;
  status: string;
}

export const trainingData: Training[] = [
  {
    id: 1,
    date: "2024-06-25",
    name: "Fire Safety Training",
    facilitator: "John Wilson",
    type: "Staff Training",
    audience: "All",
    duration: "2 hours",
    time: "09:00 AM",
    status: "Upcoming"
  },
  {
    id: 2,
    date: "2024-06-20",
    name: "First Aid Certification",
    facilitator: "Dr. Sarah Chen",
    type: "Staff Training",
    audience: "Department",
    duration: "4 hours",
    time: "02:00 PM",
    status: "In Progress"
  },
  {
    id: 3,
    date: "2024-06-30",
    name: "Data Security Workshop",
    facilitator: "Mike Rodriguez",
    type: "Staff Forum",
    audience: "Specific Employees",
    duration: "3 hours",
    time: "10:00 AM",
    status: "Upcoming"
  },
  {
    id: 4,
    date: "2024-06-15",
    name: "Leadership Development",
    facilitator: "Emma Thompson",
    type: "Staff Training",
    audience: "Department",
    duration: "6 hours",
    time: "09:00 AM",
    status: "Done"
  },
  {
    id: 5,
    date: "2024-07-05",
    name: "Workplace Safety Orientation",
    facilitator: "Robert Davis",
    type: "Staff Training",
    audience: "All",
    duration: "1.5 hours",
    time: "11:00 AM",
    status: "Upcoming"
  },
  {
    id: 6,
    date: "2024-06-18",
    name: "Team Building Workshop",
    facilitator: "Lisa Park",
    type: "Staff Forum",
    audience: "Department",
    duration: "4 hours",
    time: "01:00 PM",
    status: "Done"
  },
  {
    id: 7,
    date: "2024-07-10",
    name: "Digital Literacy Training",
    facilitator: "Alex Johnson",
    type: "Staff Training",
    audience: "Specific Employees",
    duration: "3 hours",
    time: "02:30 PM",
    status: "Upcoming"
  },
  {
    id: 8,
    date: "2024-06-22",
    name: "Customer Service Excellence",
    facilitator: "Maria Garcia",
    type: "Staff Forum",
    audience: "All",
    duration: "2.5 hours",
    time: "10:30 AM",
    status: "In Progress"
  }
];

export function getTrainingById(id: number): Training | undefined {
  return trainingData.find(training => training.id === id);
}

export const attendeesData = [
  { id: 1, name: "John Smith", department: "IT", time: "09:05 AM" },
  { id: 2, name: "Sarah Johnson", department: "HR", time: "08:55 AM" },
  { id: 3, name: "Michael Brown", department: "Finance", time: "09:02 AM" },
  { id: 4, name: "Emily Davis", department: "Marketing", time: "09:10 AM" },
  { id: 5, name: "Robert Wilson", department: "Operations", time: "09:00 AM" },
  { id: 6, name: "Jennifer Lee", department: "IT", time: "08:50 AM" },
  { id: 7, name: "David Martinez", department: "HR", time: "09:15 AM" },
  { id: 8, name: "Lisa Thompson", department: "Finance", time: "09:05 AM" },
  { id: 9, name: "James Anderson", department: "Marketing", time: "09:07 AM" },
  { id: 10, name: "Patricia Garcia", department: "Operations", time: "09:03 AM" },
  { id: 11, name: "Richard Taylor", department: "IT", time: "08:58 AM" },
  { id: 12, name: "Elizabeth White", department: "HR", time: "09:12 AM" },
  { id: 13, name: "Thomas Harris", department: "Finance", time: "09:01 AM" },
  { id: 14, name: "Nancy Clark", department: "Marketing", time: "09:08 AM" },
  { id: 15, name: "Daniel Lewis", department: "Operations", time: "09:04 AM" },
];

export const departmentBreakdown = [
  { department: "IT", count: 3 },
  { department: "HR", count: 3 },
  { department: "Finance", count: 3 },
  { department: "Marketing", count: 3 },
  { department: "Operations", count: 3 },
];

export const attendanceRateData = [
  { date: "9:00", rate: 20 },
  { date: "9:05", rate: 65 },
  { date: "9:10", rate: 85 },
  { date: "9:15", rate: 95 },
  { date: "9:20", rate: 100 },
];
