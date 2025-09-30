import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, BookOpen, TrendingUp } from "lucide-react";

interface EnrolledStudent {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  coursesCount: number;
  assignmentsCompleted: number;
  avgGrade: number;
}

export default function StudentsPage() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/courses"],
    enabled: !!user && user.role === "teacher",
  });

  // Get unique students from all courses
  const students: EnrolledStudent[] = [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <GradientText>Manage Students</GradientText>
            </h1>
            <p className="text-muted-foreground">
              View and manage students enrolled in your courses
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-secondary/20">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Students List */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Enrolled Students</GradientText>
          </h2>

          {students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 glass-morphism rounded-lg hover:border-primary/50 transition-all"
                  data-testid={`student-card-${student.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{student.firstName} {student.lastName}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="font-semibold">{student.coursesCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="font-semibold">{student.assignmentsCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Avg Grade</p>
                      <Badge variant="outline">{student.avgGrade}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students enrolled yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Students will appear here once they enroll in your courses
              </p>
            </div>
          )}
        </GlassCard>

        {/* Course Enrollment Overview */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Course Enrollment</GradientText>
          </h2>

          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 glass-morphism rounded-lg"
                  data-testid={`course-enrollment-${course.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <Badge variant="outline">
                      0 students
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses created yet</p>
            </div>
          )}
        </GlassCard>
      </div>
    </MainLayout>
  );
}
