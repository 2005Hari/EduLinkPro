import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Course } from "@shared/schema";
import { CourseCard } from "@/components/dashboard/course-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertCourseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Grid, 
  List,
  Plus,
  Users,
  Clock,
  Star
} from "lucide-react";

type CourseFormData = z.infer<typeof insertCourseSchema>;

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  // Course creation mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
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

  const onCreateCourse = (data: CourseFormData) => {
    createCourseMutation.mutate(data);
  };

  const handleCreateCourse = () => setCreateCourseOpen(true);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && course.isActive;
    if (filterStatus === "completed") return matchesSearch && !course.isActive;
    
    return matchesSearch;
  });

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="text-primary w-12 h-12" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        <GradientText>No Courses Yet</GradientText>
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {user?.role === "student" 
          ? "You haven't enrolled in any courses yet. Start your learning journey!"
          : "You haven't created any courses yet. Create your first course to get started."
        }
      </p>
      {user?.role === "teacher" && (
        <Button 
          className="neon-glow" 
          onClick={handleCreateCourse}
          data-testid="button-create-course-empty"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      )}
    </motion.div>
  );

  return (
    <MainLayout>
      <div className="space-y-6" data-testid="page-courses">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <GradientText>
                {user?.role === "student" ? "My Courses" : "Manage Courses"}
              </GradientText>
            </h1>
            <p className="text-muted-foreground">
              {user?.role === "student" 
                ? "Track your learning progress and access course materials"
                : "Create and manage your courses"
              }
            </p>
          </div>
          
          {user?.role === "teacher" && (
            <Button 
              className="neon-glow" 
              onClick={handleCreateCourse}
              data-testid="button-create-course-header"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          )}
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-xl font-bold">{courses.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                <Star className="text-green-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">
                  {courses.filter((c) => c.isActive).length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Users className="text-secondary w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-bold">--</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Clock className="text-accent w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="text-xl font-bold">--</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-courses"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("active")}
                data-testid="filter-active"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("completed")}
                data-testid="filter-completed"
              >
                Completed
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="view-grid"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Courses Grid/List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="h-40 bg-muted/50 rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted/50 rounded mb-2"></div>
                  <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                </GlassCard>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredCourses.map((course: any, index: number) => (
                <motion.div
                  key={course.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`course-card-${index}`}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Course Dialog */}
        <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
          <DialogContent className="glass-morphism border-neon">
            <DialogHeader>
              <DialogTitle>
                Create New Course
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
                  <Button 
                    type="submit" 
                    className="neon-glow"
                    disabled={createCourseMutation.isPending}
                    data-testid="button-submit-course"
                  >
                    {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}