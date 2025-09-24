import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { CourseCard } from "./course-card";
import { BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  progress?: number;
}

interface CourseListProps {
  courses: Course[];
  title: string;
  limit?: number;
}

export function CourseList({ courses, title, limit }: CourseListProps) {
  const displayCourses = limit ? courses.slice(0, limit) : courses;

  return (
    <GlassCard className="p-6 neon-glow">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>{title}</GradientText>
      </h2>
      <div className="space-y-4">
        {displayCourses.length > 0 ? (
          displayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses available</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
