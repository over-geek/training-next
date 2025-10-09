"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Play, 
  Plus, 
  UserPlus, 
  UserX, 
  CreditCard,
  Clock,
  Loader2,
  MessageSquare,
  IdCard
} from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { TrainingService } from "@/services/trainings/training-service"
import type { ActivityLog } from "@/services/trainings/types"
import { toast } from "sonner"

interface ActivityFeedProps {
  className?: string;
}

const getActivityIcon = (type: ActivityLog['type']) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'training_ended':
      return <CheckCircle className={`${iconClass} text-white`} />;
    case 'training_started':
      return <Play className={`${iconClass} text-white`} />;
    case 'training_created':
      return <Plus className={`${iconClass} text-white`} />;
    case 'attendee_created':
      return <UserPlus className={`${iconClass} text-white`} />;
    case 'access_revoked':
      return <UserX className={`${iconClass} text-white`} />;
    case 'card_updated':
      return <IdCard className={`${iconClass} text-white`} />;
    case 'evaluation_submitted':
      return <MessageSquare className={`${iconClass} text-white`} />;
    default:
      return <Clock className={`${iconClass} text-white`} />;
  }
};

const getActivityBadge = (type: ActivityLog['type']) => {
  switch (type) {
    case 'training_ended':
      return <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">Completed</Badge>;
    case 'training_started':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">Started</Badge>;
    case 'training_created':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-0">New Training</Badge>;
    case 'attendee_created':
      return <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">New Attendee</Badge>;
    case 'access_revoked':
      return <Badge variant="secondary" className="bg-red-100 text-red-700 border-0">Access Revoked</Badge>;
    case 'card_updated':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">Card Updated</Badge>;
    case 'evaluation_submitted':
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">Evaluation</Badge>;
    default:
      return <Badge variant="secondary" className="border-0">Activity</Badge>;
  }
};

const getIconBackgroundColor = (type: ActivityLog['type']) => {
  switch (type) {
    case 'training_ended':
      return 'bg-green-500';
    case 'training_started':
      return 'bg-blue-500';
    case 'training_created':
      return 'bg-orange-500';
    case 'attendee_created':
      return 'bg-green-500';
    case 'access_revoked':
      return 'bg-red-500';
    case 'card_updated':
      return 'bg-blue-500';
    case 'evaluation_submitted':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ActivityFeed({ className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      const data = await TrainingService.getActivityLogs();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error('Failed to load activity feed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 6);
      setIsLoadingMore(false);
    }, 500);
  };

  const visibleActivities = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className={`h-full ${className || ''}`}
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            <p className="text-sm text-muted-foreground">Recent activities across the platform</p>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading activities...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={`h-full ${className || ''}`}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Activity Feed</CardTitle>
          <p className="text-sm text-muted-foreground">Recent activities across the platform</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {activities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">Activity will appear here as events occur</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border"></div>
                  
                  <div className="space-y-6">
                    {visibleActivities.map((activity, index) => (
                      <motion.div
                        key={`${activity.type}-${activity.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative flex items-start space-x-4"
                      >
                        {/* Timeline Icon */}
                        <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${getIconBackgroundColor(activity.type)} border-2 border-white shadow-sm flex items-center justify-center z-10`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            {getActivityBadge(activity.type)}
                            <span className="text-xs text-muted-foreground">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          {activity.comment && (
                            <div className="mt-2 p-2 bg-muted/50 rounded-md border-l-2 border-primary">
                              <p className="text-xs text-muted-foreground italic">
                                "{activity.comment}"
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {hasMore && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
