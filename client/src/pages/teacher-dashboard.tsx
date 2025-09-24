import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NeonButton } from "@/components/ui/neon-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, insertAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Users, BookOpen, ClipboardCheck, TrendingUp, Upload, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type CourseFormData = z.infer<typeof insertCourseSchema>;
type AssignmentFormData = z.infer<typeof insertAssignmentSchema>;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);

  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  const { data: analytics = {} } = useQuery<any>({
    queryKey: ["/api/teacher/analytics"],
    enabled: !!user && user.role === "teacher",
  });

  // Course creation mutation
  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => 
      apiRequest("/api/courses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      setCreateCourseOpen(false);
      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      courseForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Course form
  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Assignment creation mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/analytics"] });
      setCreateAssignmentOpen(false);
      toast({
        title: "Success",
        description: "Assignment created successfully!",
      });
      assignmentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Assignment form
  const assignmentForm = useForm<AssignmentFormData>({
    resolver: zodResolver(insertAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      dueDate: new Date(),
      maxPoints: 100 as number,
    },
  });

  const onCreateCourse = (data: CourseFormData) => {
    createCourseMutation.mutate(data);
  };

  const onCreateAssignment = (data: AssignmentFormData) => {
    createAssignmentMutation.mutate(data);
  };

  // Click handlers
  const handleCreateCourse = () => setCreateCourseOpen(true);
  const handleCreateAssignment = () => setCreateAssignmentOpen(true);
  const handleManageStudents = () => setLocation("/students");
  const handleViewAnalytics = () => setLocation("/analytics");
  const handleManageCourse = (courseId: string) => setLocation(`/courses/${courseId}/manage`);

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
      value: analytics?.totalStudents?.toString() || "0",
      icon: Users,
      color: "secondary",
      trend: analytics?.totalStudents > 0 ? `+${analytics.totalStudents}` : "0"
    },
    {
      title: "Assignments Graded",
      value: analytics?.assignmentsGraded?.toString() || "0",
      icon: ClipboardCheck,
      color: "accent",
      trend: analytics?.assignmentsGraded > 0 ? `+${analytics.assignmentsGraded}` : "0"
    },
    {
      title: "Average Grade",
      value: analytics?.averageGrade?.toString() || "0",
      icon: TrendingUp,
      color: "green",
      trend: analytics?.averageGrade > 0 ? `${analytics.averageGrade}/10` : "N/A"
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
                    <NeonButton size="sm" neon onClick={() => handleManageCourse(course.id)} data-testid={`button-manage-course-${course.id}`}>
                      Manage
                    </NeonButton>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses created yet</p>
                <NeonButton className="mt-4" neon onClick={handleCreateCourse} data-testid="button-create-first-course">
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
            <NeonButton className="w-full justify-start" variant="outline" neon onClick={handleCreateCourse} data-testid="button-create-course">
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon onClick={handleCreateAssignment} data-testid="button-create-assignment">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Create Assignment
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon onClick={handleManageStudents} data-testid="button-manage-students">
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </NeonButton>
            <NeonButton className="w-full justify-start" variant="outline" neon onClick={handleViewAnalytics} data-testid="button-view-analytics">
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
        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {analytics.recentActivity.map((activity: any, index: number) => (
              <div key={activity.id || index} className="flex items-center justify-between p-3 glass-morphism rounded-lg">
                <div className="flex items-center space-x-3">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{activity.studentName} submitted {activity.assignmentTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {activity.status} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        )}
      </GlassCard>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-glow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateCourse}
        data-testid="button-floating-action"
      >
        <Plus className="w-6 h-6 mx-auto" />
      </motion.button>

      {/* Course Creation Dialog */}
      <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
        <DialogContent className="glass-morphism border-neon">
          <DialogHeader>
            <DialogTitle>
              <GradientText>Create New Course</GradientText>
            </DialogTitle>
          </DialogHeader>
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onCreateCourse)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter course title..." 
                        {...field} 
                        data-testid="input-course-title"
                        className="glass-morphism"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description..." 
                        {...field} 
                        data-testid="textarea-course-description"
                        className="glass-morphism min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateCourseOpen(false)}
                  data-testid="button-cancel-course"
                >
                  Cancel
                </Button>
                <NeonButton 
                  type="submit" 
                  neon 
                  disabled={createCourseMutation.isPending}
                  data-testid="button-submit-course"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </NeonButton>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assignment Creation Dialog */}
      <Dialog open={createAssignmentOpen} onOpenChange={setCreateAssignmentOpen}>
        <DialogContent className="glass-morphism border-neon max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <GradientText>Create New Assignment</GradientText>
            </DialogTitle>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit(onCreateAssignment)} className="space-y-4">
              <FormField
                control={assignmentForm.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-morphism" data-testid="select-course">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter assignment title..." 
                        {...field} 
                        data-testid="input-assignment-title"
                        className="glass-morphism"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={assignmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter assignment description..." 
                        {...field} 
                        data-testid="textarea-assignment-description"
                        className="glass-morphism min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={assignmentForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "glass-morphism w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-due-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-morphism" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={assignmentForm.control}
                  name="maxPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Points</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-max-points"
                          className="glass-morphism"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateAssignmentOpen(false)}
                  data-testid="button-cancel-assignment"
                >
                  Cancel
                </Button>
                <NeonButton 
                  type="submit" 
                  neon 
                  disabled={createAssignmentMutation.isPending}
                  data-testid="button-submit-assignment"
                >
                  {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                </NeonButton>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
