import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NeonButton } from "@/components/ui/neon-button";
import { AssignmentCard } from "./assignment-card";
import { ClipboardList } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  courseTitle?: string;
  status?: string;
}

interface AssignmentDeadlinesProps {
  assignments: Assignment[];
  limit?: number;
}

export function AssignmentDeadlines({ assignments, limit = 3 }: AssignmentDeadlinesProps) {
  const upcomingAssignments = assignments
    .filter((a) => !a.status || a.status === "pending")
    .slice(0, limit);

  return (
    <GlassCard className="p-6 neon-glow">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>Upcoming Deadlines</GradientText>
      </h2>
      <div className="space-y-4">
        {upcomingAssignments.length > 0 ? (
          upcomingAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="text-center py-8">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending assignments</p>
          </div>
        )}
      </div>
      <NeonButton className="w-full mt-4" variant="outline" neon>
        View All Assignments
      </NeonButton>
    </GlassCard>
  );
}
