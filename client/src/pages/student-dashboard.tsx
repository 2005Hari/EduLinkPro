import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CourseCard } from "@/components/dashboard/course-card";
import { AssignmentCard } from "@/components/dashboard/assignment-card";
import { TimetableWidget } from "@/components/dashboard/timetable-widget";
import { AnnouncementCard } from "@/components/dashboard/announcement-card";
import { WellnessMonitor } from "@/components/dashboard/wellness-monitor";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GradientText } from "@/components/ui/gradient-text";
import { motion } from "framer-motion";
import { Plus, BookOpen, ClipboardList, Calendar, Bell, MessageSquare, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course, Assignment, Announcement, TimetableEntry, Meeting } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    enabled: !!user,
  });

  const { data: timetable = [] } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/timetable"],
    enabled: !!user,
  });

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
    enabled: !!user,
  });

  const stats = [
    {
      title: "Course Progress",
      value: "87%",
      icon: BookOpen,
      color: "primary",
      trend: "+5%"
    },
    {
      title: "Active Courses",
      value: courses.length.toString(),
      icon: BookOpen,
      color: "secondary",
      trend: "+2"
    },
    {
      title: "Pending Tasks",
      value: assignments.filter((a: any) => !a.status || a.status === "pending").length.toString(),
      icon: ClipboardList,
      color: "accent",
      trend: "-1"
    },
    {
      title: "Average Grade",
      value: "A+",
      icon: Calendar,
      color: "green",
      trend: "+0.2"
    }
  ];

  const upcomingAssignments = assignments
    .filter((a: any) => !a.status || a.status === "pending")
    .slice(0, 3);

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <MainLayout>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Continue Learning</GradientText>
            </h2>
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.slice(0, 3).map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Upcoming Deadlines</GradientText>
            </h2>
            <div className="space-y-4">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment: any) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending assignments</p>
                </div>
              )}
            </div>
            <NeonButton className="w-full mt-4" variant="outline" neon>
              View All Assignments
            </NeonButton>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Chart */}
        <PerformanceChart />
        
        {/* Wellness Monitor */}
        <WellnessMonitor />
      </div>

      {/* Timetable */}
      <TimetableWidget timetable={timetable} />

      {/* Notifications & Updates */}
      <GlassCard className="p-6 neon-glow mb-8">
        <h2 className="text-xl font-semibold mb-6">
          <GradientText className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            Notifications & Updates
          </GradientText>
        </h2>
        <div className="space-y-3" data-testid="student-notifications-list">
          {/* Upcoming Parent-Teacher Meetings */}
          {meetings.length > 0 && meetings.slice(0, 3).map((meeting) => (
            <div key={meeting.id} className="p-4 glass-morphism rounded-lg flex items-start gap-3">
              <Video className="h-5 w-5 text-secondary mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">Parent-Teacher Meeting</p>
                  <Badge variant="outline" className="text-xs">
                    {meeting.status || "scheduled"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {meeting.title || "Meeting scheduled"} 
                  {meeting.scheduledAt && ` - ${new Date(meeting.scheduledAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          ))}

          {/* New Assignments Indicator */}
          {assignments.filter((a: any) => !a.status || a.status === "pending").length > 0 && (
            <div className="p-4 glass-morphism rounded-lg flex items-start gap-3">
              <ClipboardList className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">New Assignments</p>
                <p className="text-xs text-muted-foreground">
                  You have {assignments.filter((a: any) => !a.status || a.status === "pending").length} pending assignments
                </p>
              </div>
            </div>
          )}

          {/* Recent Announcements Preview */}
          {announcements.length > 0 && announcements.slice(0, 1).map((announcement: any) => (
            <div key={announcement.id} className="p-4 glass-morphism rounded-lg flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">New Announcement</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
              </div>
            </div>
          ))}

          {meetings.length === 0 && assignments.filter((a: any) => !a.status || a.status === "pending").length === 0 && announcements.length === 0 && (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No new notifications</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Recent Announcements */}
      <GlassCard className="p-6 neon-glow">
        <h2 className="text-xl font-semibold mb-6">
          <GradientText>Recent Announcements</GradientText>
        </h2>
        <div className="space-y-4">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement: any) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No announcements yet</p>
            </div>
          )}
        </div>
        <NeonButton className="w-full mt-6" variant="outline" neon>
          View All Announcements
        </NeonButton>
      </GlassCard>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-glow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-floating-action"
      >
        <Plus className="w-6 h-6 mx-auto" />
      </motion.button>
    </MainLayout>
  );
}
