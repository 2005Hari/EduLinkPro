import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function ParentDashboard() {
  const stats = [
    {
      title: "Overall Grade",
      value: "87%",
      icon: GraduationCap,
      color: "primary",
      trend: "+3%"
    },
    {
      title: "Attendance",
      value: "95%",
      icon: Calendar,
      color: "secondary",
      trend: "+2%"
    },
    {
      title: "Active Courses",
      value: "12",
      icon: TrendingUp,
      color: "accent",
      trend: "0"
    },
    {
      title: "Upcoming Tasks",
      value: "3",
      icon: AlertTriangle,
      color: "green",
      trend: "-1"
    }
  ];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Child Info */}
        <GlassCard className="p-6 neon-glow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              <GradientText className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6" />
                Alex Chen - Grade 11
              </GradientText>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Academic Performance */}
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                Academic Performance
              </GradientText>
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Advanced React Development</span>
                  <span className="font-semibold">A+</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Data Structures & Algorithms</span>
                  <span className="font-semibold">A</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Machine Learning Fundamentals</span>
                  <span className="font-semibold">B+</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Database Systems</span>
                  <span className="font-semibold">A</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>
          </GlassCard>

          {/* Wellness Monitor */}
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                Wellness Monitor
              </GradientText>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Mood</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Good</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Focus Level</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm text-primary">High</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Stress Level</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-400">Moderate</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Sleep Quality</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-400">Good</span>
                </div>
              </div>

              <div className="mt-4 p-3 glass-morphism rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>AI Insight:</strong> Alex is showing good overall wellbeing. 
                  Consider encouraging more breaks during study sessions to reduce stress.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Recent Activity</GradientText>
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Assignment Submitted</p>
                  <p className="text-xs text-muted-foreground">React Final Project - Advanced React Development</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Grade Received</p>
                  <p className="text-xs text-muted-foreground">Algorithm Analysis Quiz - Grade: A</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg">
                <Calendar className="h-5 w-5 text-secondary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Class Attended</p>
                  <p className="text-xs text-muted-foreground">Machine Learning Fundamentals</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Alerts & Notifications</GradientText>
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-accent">
                <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Upcoming Deadline</p>
                  <p className="text-xs text-muted-foreground">ML Model Training due in 3 days</p>
                  <Badge variant="outline" className="mt-1">Important</Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-primary">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Great Progress!</p>
                  <p className="text-xs text-muted-foreground">Alex improved in Data Structures by 15% this month</p>
                  <Badge variant="outline" className="mt-1">Achievement</Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-green-400">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Perfect Attendance</p>
                  <p className="text-xs text-muted-foreground">Alex maintained 100% attendance this week</p>
                  <Badge variant="outline" className="mt-1">Excellent</Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </MainLayout>
  );
}
