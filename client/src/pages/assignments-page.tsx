import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Eye
} from "lucide-react";

export default function AssignmentsPage() {
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const getStatusColor = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    if (status === "graded") return "text-green-400";
    if (status === "submitted") return "text-blue-400";
    if (isOverdue) return "text-destructive";
    return "text-yellow-400";
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    if (status === "graded") return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === "submitted") return <FileText className="h-4 w-4 text-blue-400" />;
    if (isOverdue) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-yellow-400" />;
  };

  const getStatusText = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    if (status === "graded") return "Graded";
    if (status === "submitted") return "Submitted";
    if (isOverdue) return "Overdue";
    return "Pending";
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <GradientText>Assignments</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Track your assignments and submit your work
            </p>
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-4 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {assignments.filter((a: any) => !a.status || a.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold text-blue-400">
                  {assignments.filter((a: any) => a.status === "submitted").length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-4 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold text-green-400">
                  {assignments.filter((a: any) => a.status === "graded").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </GlassCard>
        </div>

        {/* Assignments List */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>All Assignments</GradientText>
          </h2>
          
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment: any) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-morphism rounded-lg p-4 hover:neon-border transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(assignment.status, assignment.dueDate)}
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <Badge variant="outline" className={getStatusColor(assignment.status, assignment.dueDate)}>
                          {getStatusText(assignment.status, assignment.dueDate)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {assignment.courseTitle}
                      </p>
                      
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        {assignment.maxPoints && (
                          <div>
                            Max Points: {assignment.maxPoints}
                          </div>
                        )}
                        {assignment.grade && (
                          <div className="text-green-400">
                            Grade: {assignment.grade}/{assignment.maxPoints}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {assignment.status === "graded" ? (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Grade
                        </Button>
                      ) : assignment.status === "submitted" ? (
                        <Badge variant="secondary">
                          Submitted {assignment.submittedAt && format(new Date(assignment.submittedAt), "MMM d")}
                        </Badge>
                      ) : (
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {assignment.status === "submitted" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Submitted on</span>
                        <span>{assignment.submittedAt && format(new Date(assignment.submittedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground">
                  Your assignments will appear here when teachers create them.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </MainLayout>
  );
}
