import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, User } from "lucide-react";
import { useState, useEffect } from "react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

interface Assignment {
  id: string;
  title: string;
  status: string | null;
  grade: number | null;
  maxPoints: number;
  dueDate: string;
  courseTitle: string;
  submittedAt: string | null;
}

interface Course {
  id: string;
  title: string;
  progress: number;
}

interface Emotion {
  id: string;
  mood: string;
  energy: number;
  confidence: number;
  stress: number;
  focus: number;
  detectedAt: string;
}

export default function ParentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  // Fetch children
  const { data: children = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ['/api/children'],
  });

  // Fetch selected child's data
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ['/api/children', selectedChildId, 'assignments'],
    enabled: !!selectedChildId,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/children', selectedChildId, 'courses'],
    enabled: !!selectedChildId,
  });

  const { data: emotions = [], isLoading: emotionsLoading } = useQuery<Emotion[]>({
    queryKey: ['/api/children', selectedChildId, 'emotions'],
    enabled: !!selectedChildId,
  });

  // Set default child selection safely
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find(child => child.id === selectedChildId);

  // Calculate stats from real data
  const getStats = () => {
    const gradedAssignments = assignments.filter(a => a.grade !== null);
    const totalGrade = gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
    const overallGrade = gradedAssignments.length > 0 ? Math.round(totalGrade / gradedAssignments.length) : 0;
    
    const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === null);
    const avgProgress = courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length) : 0;

    // Calculate attendance rate based on comprehensive student engagement metrics
    // Uses assignment submission patterns, course progress, and timing patterns as attendance indicators
    const submittedAssignments = assignments.filter(a => a.submittedAt !== null);
    const onTimeSubmissions = assignments.filter(a => {
      if (!a.submittedAt || !a.dueDate) return false;
      return new Date(a.submittedAt) <= new Date(a.dueDate);
    });
    
    let attendanceRate = 0;
    if (assignments.length > 0 && courses.length > 0) {
      // Combination of submission rate (60%), on-time rate (30%), and course progress (10%)
      const submissionRate = (submittedAssignments.length / assignments.length) * 60;
      const onTimeRate = assignments.length > 0 ? (onTimeSubmissions.length / assignments.length) * 30 : 0;
      const progressRate = (avgProgress / 100) * 10;
      attendanceRate = Math.round(submissionRate + onTimeRate + progressRate);
    } else if (courses.length > 0) {
      // If only courses, use progress as attendance indicator
      attendanceRate = Math.round(avgProgress * 0.8); // Slightly lower since no assignment data
    }

    return [
      {
        title: "Overall Grade",
        value: gradedAssignments.length > 0 ? `${overallGrade}%` : "No grades yet",
        icon: GraduationCap,
        color: "primary" as const,
        trend: gradedAssignments.length > 0 ? (overallGrade >= 70 ? "+good" : "needs improvement") : "0"
      },
      {
        title: "Attendance Rate",
        value: assignments.length > 0 ? `${attendanceRate}%` : "No data",
        icon: Calendar,
        color: "secondary" as const,
        trend: assignments.length > 0 ? (attendanceRate >= 80 ? "+excellent" : attendanceRate >= 60 ? "+good" : "needs attention") : "0"
      },
      {
        title: "Active Courses",
        value: courses.length.toString(),
        icon: TrendingUp,
        color: "accent" as const,
        trend: courses.length > 0 ? `${courses.length} enrolled` : "0"
      },
      {
        title: "Pending Tasks",
        value: assignments.length > 0 ? pendingAssignments.length.toString() : "No assignments",
        icon: AlertTriangle,
        color: pendingAssignments.length === 0 ? "green" as const : "orange" as const,
        trend: assignments.length > 0 ? (pendingAssignments.length === 0 ? "all complete" : `${pendingAssignments.length} pending`) : "0"
      }
    ];
  };

  const stats = getStats();

  if (childrenLoading) {
    return (
      <MainLayout>
        <div className="space-y-8 animate-pulse" data-testid="loading-parent-dashboard">
          <GlassCard className="p-6 neon-glow">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
        data-testid="page-parent-dashboard"
      >
        {/* Child Selection */}
        {children.length > 0 && (
          <GlassCard className="p-6 neon-glow">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                <GradientText>Parent Dashboard</GradientText>
              </h1>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Select Child:</label>
                <Select 
                  value={selectedChildId} 
                  onValueChange={setSelectedChildId}
                  data-testid="select-child"
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Child Info & Stats */}
        {selectedChild && (
          <GlassCard className="p-6 neon-glow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                <GradientText className="flex items-center gap-3">
                  <User className="h-6 w-6" />
                  {selectedChild.firstName} {selectedChild.lastName}
                </GradientText>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Username: {selectedChild.username} • Email: {selectedChild.email}
              </p>
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Academic Performance */}
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                Academic Performance
              </GradientText>
            </h2>
            {coursesLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-4" data-testid="child-courses">
                {courses.slice(0, 4).map((course) => {
                  const progress = course.progress || 0;
                  const getGrade = (progress: number) => {
                    if (progress >= 90) return "A+";
                    if (progress >= 85) return "A";
                    if (progress >= 80) return "B+";
                    if (progress >= 75) return "B";
                    if (progress >= 70) return "C+";
                    if (progress >= 65) return "C";
                    return "D";
                  };

                  return (
                    <div key={course.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{course.title}</span>
                        <span className="font-semibold">{getGrade(progress)}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No courses enrolled yet.</p>
            )}
          </GlassCard>

          {/* Wellness Monitor */}
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                Wellness Monitor
              </GradientText>
            </h2>
            {emotionsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : emotions.length > 0 ? (
              <div className="space-y-4" data-testid="child-wellness">
                {(() => {
                  const recentEmotion = emotions[0]; // Most recent emotion
                  const avgEnergy = Math.round(recentEmotion.energy || 50);
                  const avgConfidence = Math.round(recentEmotion.confidence || 50);
                  const avgStress = Math.round(recentEmotion.stress || 50);
                  const avgFocus = Math.round(recentEmotion.focus || 50);

                  const getStatusColor = (value: number, isReverse = false) => {
                    if (isReverse) {
                      if (value >= 70) return "text-red-400";
                      if (value >= 40) return "text-yellow-400";
                      return "text-green-400";
                    }
                    if (value >= 70) return "text-green-400";
                    if (value >= 40) return "text-yellow-400";
                    return "text-red-400";
                  };

                  const getStatusText = (value: number, isReverse = false) => {
                    if (isReverse) {
                      if (value >= 70) return "High";
                      if (value >= 40) return "Moderate";
                      return "Low";
                    }
                    if (value >= 70) return "High";
                    if (value >= 40) return "Moderate";
                    return "Low";
                  };

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Mood</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(avgEnergy).replace('text-', 'bg-')}`}></div>
                          <span className={`text-sm ${getStatusColor(avgEnergy)}`}>
                            {recentEmotion.mood || getStatusText(avgEnergy)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Energy Level</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(avgEnergy).replace('text-', 'bg-')}`}></div>
                          <span className={`text-sm ${getStatusColor(avgEnergy)}`}>
                            {getStatusText(avgEnergy)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Focus Level</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(avgFocus).replace('text-', 'bg-')}`}></div>
                          <span className={`text-sm ${getStatusColor(avgFocus)}`}>
                            {getStatusText(avgFocus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stress Level</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(avgStress, true).replace('text-', 'bg-')}`}></div>
                          <span className={`text-sm ${getStatusColor(avgStress, true)}`}>
                            {getStatusText(avgStress, true)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 glass-morphism rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>AI Insight:</strong> {selectedChild?.firstName} is showing{" "}
                          {avgStress < 30 && avgFocus > 60 ? "excellent" : avgStress < 50 ? "good" : "moderate"} 
                          {" "}wellbeing patterns. 
                          {avgStress > 60 && " Consider encouraging more breaks to reduce stress levels."}
                          {avgFocus < 40 && " Focus support may be beneficial."}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last recorded: {new Date(recentEmotion.detectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No wellness data available yet.</p>
            )}
          </GlassCard>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Recent Activity</GradientText>
            </h2>
            {assignmentsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 glass-morphism rounded-lg space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-3" data-testid="child-activity">
                {assignments.slice(0, 5).map((assignment) => {
                  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
                  const isGraded = assignment.status === 'graded' && assignment.grade !== null;
                  const timeAgo = assignment.submittedAt 
                    ? `${Math.floor((new Date().getTime() - new Date(assignment.submittedAt).getTime()) / (1000 * 60 * 60))} hours ago`
                    : 'Recently';

                  return (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 glass-morphism rounded-lg">
                      {isGraded ? (
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      ) : isSubmitted ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {isGraded ? 'Grade Received' : isSubmitted ? 'Assignment Submitted' : 'Assignment Pending'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.title} - {assignment.courseTitle}
                          {isGraded && assignment.grade && ` - Grade: ${Math.round((assignment.grade / assignment.maxPoints) * 100)}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent activity available.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Alerts & Notifications</GradientText>
            </h2>
            {assignmentsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 glass-morphism rounded-lg space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-3" data-testid="child-alerts">
                {(() => {
                  const alerts = [];
                  
                  // Upcoming deadlines
                  const upcomingAssignments = assignments.filter(a => {
                    if (!a.dueDate) return false;
                    const dueDate = new Date(a.dueDate);
                    const now = new Date();
                    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays > 0 && diffDays <= 7 && (a.status === 'pending' || a.status === null);
                  });

                  upcomingAssignments.slice(0, 2).forEach(assignment => {
                    const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    alerts.push(
                      <div key={`deadline-${assignment.id}`} className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-accent">
                        <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Upcoming Deadline</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.title} due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                          </p>
                          <Badge variant="outline" className="mt-1">Important</Badge>
                        </div>
                      </div>
                    );
                  });

                  // Recent achievements
                  const recentGrades = assignments.filter(a => a.status === 'graded' && a.grade && a.grade >= (a.maxPoints * 0.85));
                  if (recentGrades.length > 0) {
                    const bestGrade = recentGrades[0];
                    const percentage = Math.round(((bestGrade.grade || 0) / bestGrade.maxPoints) * 100);
                    alerts.push(
                      <div key={`achievement-${bestGrade.id}`} className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-primary">
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Great Performance!</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedChild?.firstName} scored {percentage}% on {bestGrade.title}
                          </p>
                          <Badge variant="outline" className="mt-1">Achievement</Badge>
                        </div>
                      </div>
                    );
                  }

                  // Course progress
                  const activeCourses = courses.filter(c => (c.progress || 0) > 0);
                  if (activeCourses.length > 0) {
                    alerts.push(
                      <div key="course-progress" className="flex items-start gap-3 p-3 glass-morphism rounded-lg border-l-4 border-green-400">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Active Learning</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedChild?.firstName} is enrolled in {activeCourses.length} active course{activeCourses.length !== 1 ? 's' : ''}
                          </p>
                          <Badge variant="outline" className="mt-1">Progress</Badge>
                        </div>
                      </div>
                    );
                  }

                  return alerts.length > 0 ? alerts : (
                    <p className="text-muted-foreground text-sm">No alerts at this time.</p>
                  );
                })()}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No alerts available.</p>
            )}
          </GlassCard>
        </div>

        {/* No children message */}
        {children.length === 0 && !childrenLoading && (
          <GlassCard className="p-8 neon-glow text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any children linked to your parent account yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your school administrator to link your children to your account.
            </p>
          </GlassCard>
        )}
      </motion.div>
    </MainLayout>
  );
}
