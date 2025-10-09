// Dashboard data store

export interface DashboardStats {
  totalCompletedTrainings: number;
  completedTrainingSessions: number;
  averageAttendees: number;
  averageEvaluations: number;
}

export interface ActivityItem {
  id: number;
  type: 'training_started' | 'training_ended' | 'attendee_registered' | 'access_revoked' | 'training_created' | 'card_updated';
  message: string;
  timestamp: string;
  relativeTime: string;
}

export interface AttendedTraining {
  name: string;
  attendees: number;
}

export interface RatingBreakdown {
  rating: string;
  count: number;
  percentage: number;
}

// Dashboard statistics
export const dashboardStats: DashboardStats = {
  totalCompletedTrainings: 0,
  completedTrainingSessions: 1,
  averageAttendees: 6,
  averageEvaluations: 0
};

// Chart data for trainings, attendees, and evaluations over months
export const chartData = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Trainings',
      data: [2, 4, 6, 8, 12, 16, 18, 20, 25, 28, 30, 32]
    },
    {
      name: 'Attendees',
      data: [15, 25, 35, 45, 65, 85, 95, 105, 125, 135, 145, 155]
    },
    {
      name: 'Evaluations',
      data: [10, 18, 25, 35, 50, 65, 75, 85, 100, 110, 120, 130]
    }
  ]
};

// Activity feed data
export const activityFeed: ActivityItem[] = [
  {
    id: 1,
    type: 'training_ended',
    message: 'BCMS has ended',
    timestamp: '2024-12-19T12:00:00Z',
    relativeTime: 'just now'
  },
  {
    id: 2,
    type: 'training_started',
    message: 'BCMS has started',
    timestamp: '2024-12-19T11:30:00Z',
    relativeTime: 'just now'
  },
  {
    id: 3,
    type: 'training_created',
    message: 'BCMS by Daniel Akakpo created',
    timestamp: '2024-12-18T15:00:00Z',
    relativeTime: '21 hours ago'
  },
  {
    id: 4,
    type: 'attendee_registered',
    message: 'Wonde Batimah was registered',
    timestamp: '2024-12-18T14:30:00Z',
    relativeTime: '21 hours ago'
  },
  {
    id: 5,
    type: 'card_updated',
    message: 'Wonde Batimah re-registered',
    timestamp: '2024-12-18T14:15:00Z',
    relativeTime: '21 hours ago'
  },
  {
    id: 6,
    type: 'attendee_registered',
    message: 'Richmond Amoo was registered',
    timestamp: '2024-12-18T14:00:00Z',
    relativeTime: '21 hours ago'
  }
];

// Most and least attended trainings
export const mostAttendedTraining: AttendedTraining = {
  name: 'BCMS',
  attendees: 6
};

export const leastAttendedTraining: AttendedTraining = {
  name: 'BCMS',
  attendees: 6
};

// Training rating breakdown
export const ratingBreakdown: RatingBreakdown[] = [
  { rating: 'Excellent', count: 45, percentage: 45 },
  { rating: 'Very Good', count: 30, percentage: 30 },
  { rating: 'Good', count: 20, percentage: 20 },
  { rating: 'Poor', count: 5, percentage: 5 }
];
