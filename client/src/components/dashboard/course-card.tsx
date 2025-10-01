import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    progress?: number;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const progress = course.progress || 0;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest("POST", `/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Enrolled!",
        description: `You've been enrolled in ${course.title}`,
      });
      // Navigate to course player
      setLocation(`/course/${course.id}`);
    },
    onError: () => {
      toast({
        title: "Already enrolled",
        description: "You're already enrolled in this course",
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (progress > 0) {
      // Already enrolled, just navigate
      setLocation(`/course/${course.id}`);
    } else {
      // Not enrolled yet, enroll first
      enrollMutation.mutate(course.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-4 hover:neon-border transition-all duration-300">
        <div className="flex items-center space-x-4">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-16 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-muted-foreground">{course.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="hover:bg-primary/80 transition-colors duration-300"
            onClick={handleContinue}
            disabled={enrollMutation.isPending}
            data-testid={`button-continue-${course.id}`}
          >
            {enrollMutation.isPending ? "Enrolling..." : progress > 0 ? "Continue" : "Start"}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
