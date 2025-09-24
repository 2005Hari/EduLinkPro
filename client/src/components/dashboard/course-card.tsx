import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
  const progress = course.progress || Math.floor(Math.random() * 100);

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
          <Button size="sm" className="hover:bg-primary/80 transition-colors duration-300">
            Continue
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
