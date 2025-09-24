import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NeonButton } from "@/components/ui/neon-button";
import { motion } from "framer-motion";
import { Plus, Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  const stats = [
    {
      title: "Active Courses",
      value: courses.length.toString(),
      icon: BookOpen,
      color: "primary",
      trend: "+2"
    },
    {
      title: "Total Students",
      value: "156",
      icon: Users,
      color: "secondary",
      trend: "+12"
    },
    {
      title: "Assignments Graded",
      value: "45",
      icon: ClipboardCheck,
      color: "accent",
      trend: "+8"
    },
    {
      title: "Course Rating",
      value: "4.8",
      icon: TrendingUp,
      color: "green",
      trend: "+0.3"
    }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Course Management */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>My Courses</GradientText>
          </h2>
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map((course: any) => (
                <GlassCard key={course.id} className="p-4 hover:neon-border transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <NeonButton size="sm" neon>
                      Manage
                    </NeonButton>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses created yet</p>
                <NeonButton className="mt-4" neon>
                  Create First Course
                </NeonButton>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Quick Actions</GradientText>
          </h2>
          <div className="space-y-4">
            <NeonButton className="w-full justify-start" variant="outline" neon>
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Create Assignment
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon>
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </NeonButton>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6 neon-glow">
        <h2 className="text-xl font-semibold mb-6">
          <GradientText>Recent Activity</GradientText>
        </h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
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
