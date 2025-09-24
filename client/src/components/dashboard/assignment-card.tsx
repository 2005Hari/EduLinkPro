import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    courseTitle?: string;
    status?: string;
  };
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  const getBorderColor = () => {
    if (isOverdue) return "border-l-destructive";
    if (daysUntilDue <= 2) return "border-l-destructive";
    if (daysUntilDue <= 5) return "border-l-accent";
    return "border-l-primary";
  };

  const getStatusBadge = () => {
    if (isOverdue) return { text: "Overdue", variant: "destructive" as const };
    if (daysUntilDue <= 2) return { text: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`, variant: "destructive" as const };
    if (daysUntilDue <= 5) return { text: `Due in ${daysUntilDue} days`, variant: "secondary" as const };
    return { text: `Due in ${daysUntilDue} days`, variant: "outline" as const };
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className={`p-4 border-l-4 ${getBorderColor()}`}>
        <h3 className="font-semibold text-sm">{assignment.title}</h3>
        {assignment.courseTitle && (
          <p className="text-xs text-muted-foreground mb-2">{assignment.courseTitle}</p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant={statusBadge.variant} className="text-xs">
            {statusBadge.text}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(dueDate, "MMM d, yyyy")}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
