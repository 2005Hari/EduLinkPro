import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Course } from "@shared/schema";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  ClipboardCheck,
  Star,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Target
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  // Mock analytics data - in real app this would come from API
  const analyticsData = {
    totalStudents: 156,
    activeStudents: 142,
    completionRate: 87,
    averageGrade: 4.2,
    engagement: 92,
    courseRating: 4.8
  };

  const performanceData = [
    { month: "Jan", students: 120, assignments: 45, completion: 82 },
    { month: "Feb", students: 135, assignments: 52, completion: 85 },
    { month: "Mar", students: 142, assignments: 48, completion: 88 },
    { month: "Apr", students: 156, assignments: 65, completion: 87 },
    { month: "May", students: 149, assignments: 58, completion: 90 },
    { month: "Jun", students: 163, assignments: 72, completion: 92 },
  ];

  const topPerformingCourses = courses.slice(0, 5).map((course, index: number) => ({
    ...course,
    enrollments: Math.floor(Math.random() * 50) + 20,
    rating: (4 + Math.random()).toFixed(1),
    completion: Math.floor(Math.random() * 30) + 70
  }));

  return (
    <MainLayout>
      <div className="space-y-6" data-testid="page-analytics">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <GradientText>Teaching Analytics</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Track student performance, course engagement, and teaching impact
            </p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{analyticsData.totalStudents}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-xl font-bold">{analyticsData.activeStudents}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Target className="text-secondary w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold">{analyticsData.completionRate}%</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Award className="text-accent w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Grade</p>
                <p className="text-xl font-bold">{analyticsData.averageGrade}/5</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-xl font-bold">{analyticsData.engagement}%</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Rating</p>
                <p className="text-xl font-bold">{analyticsData.courseRating}/5</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Analytics Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-morphism">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
              <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
              <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <GradientText>Performance Trends</GradientText>
                  </h3>
                  <PerformanceChart />
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <GradientText>Recent Activity</GradientText>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ClipboardCheck className="text-primary w-4 h-4" />
                        <span className="text-sm">New assignment submitted</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="text-secondary w-4 h-4" />
                        <span className="text-sm">5 new student enrollments</span>
                      </div>
                      <span className="text-xs text-muted-foreground">4h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span className="text-sm">Course rated 5/5 stars</span>
                      </div>
                      <span className="text-xs text-muted-foreground">1d ago</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <GradientText>Student Performance Analytics</GradientText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {performanceData.map((data, index) => (
                    <div key={data.month} className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {data.completion}%
                      </div>
                      <div className="text-sm text-muted-foreground">{data.month}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.students} students, {data.assignments} assignments
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <GradientText>Top Performing Courses</GradientText>
                </h3>
                <div className="space-y-4">
                  {topPerformingCourses.map((course, index: number) => (
                    <div key={course.id || index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{course.title || `Course ${index + 1}`}</h4>
                        <p className="text-sm text-muted-foreground">{course.enrollments} students enrolled</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="secondary">{course.rating} ★</Badge>
                        <div className="text-sm text-muted-foreground">{course.completion}% completion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <GradientText>Student Insights</GradientText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Engagement Levels</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">High Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div className="w-3/4 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-sm">75%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Medium Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div className="w-1/2 h-2 bg-yellow-400 rounded-full"></div>
                          </div>
                          <span className="text-sm">20%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Low Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div className="w-1/12 h-2 bg-red-400 rounded-full"></div>
                          </div>
                          <span className="text-sm">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Grade Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">A (90-100%)</span>
                        <Badge variant="default">45%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">B (80-89%)</span>
                        <Badge variant="secondary">30%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">C (70-79%)</span>
                        <Badge variant="outline">20%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">D (60-69%)</span>
                        <Badge variant="outline">4%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">F (Below 60%)</span>
                        <Badge variant="destructive">1%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}