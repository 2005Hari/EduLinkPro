import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { z } from "zod";
// Extended assignment type that includes submission data from API joins
type AssignmentWithSubmission = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  dueDate: Date | string;
  maxPoints: number | null;
  courseTitle?: string;
  status?: "pending" | "submitted" | "graded" | null;
  grade?: number | null;
  feedback?: string | null;
  submittedAt?: Date | string | null;
  gradedAt?: Date | string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Eye,
  Star
} from "lucide-react";

const submissionSchema = z.object({
  content: z.string().min(1, "Assignment content is required"),
  attachments: z.array(z.string()).optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const { data: assignments = [] } = useQuery<AssignmentWithSubmission[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  // Assignment submission mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, data }: { assignmentId: string; data: SubmissionFormData }) => {
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to submit assignment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      setSubmitDialogOpen(false);
      setSelectedAssignment(null);
      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      });
      submissionForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submission form
  const submissionForm = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      content: "",
      attachments: [],
    },
  });

  const onSubmitAssignment = (data: SubmissionFormData) => {
    if (selectedAssignment) {
      submitAssignmentMutation.mutate({
        assignmentId: selectedAssignment.id,
        data,
      });
    }
  };

  // Click handlers
  const handleSubmitClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
  };

  const handleViewGradeClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setGradeDialogOpen(true);
  };

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
                  {assignments.filter((a) => !a.status || a.status === "pending").length}
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
                  {assignments.filter((a) => a.status === "submitted").length}
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
                  {assignments.filter((a) => a.status === "graded").length}
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
              assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-morphism rounded-lg p-4 hover:neon-border transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(assignment.status ?? 'pending', assignment.dueDate ?? '')}
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <Badge variant="outline" className={getStatusColor(assignment.status ?? 'pending', assignment.dueDate ?? '')}>
                          {getStatusText(assignment.status ?? 'pending', assignment.dueDate ?? '')}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewGradeClick(assignment)}
                          data-testid={`button-view-grade-${assignment.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Grade
                        </Button>
                      ) : assignment.status === "submitted" ? (
                        <Badge variant="secondary">
                          Submitted {assignment.submittedAt && format(new Date(assignment.submittedAt), "MMM d")}
                        </Badge>
                      ) : (
                        <NeonButton 
                          size="sm" 
                          neon
                          onClick={() => handleSubmitClick(assignment)}
                          data-testid={`button-submit-${assignment.id}`}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Submit
                        </NeonButton>
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

        {/* Assignment Submission Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent className="glass-morphism border-neon max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                <GradientText>Submit Assignment</GradientText>
              </DialogTitle>
              {selectedAssignment && (
                <p className="text-sm text-muted-foreground">
                  {selectedAssignment.title} • Due: {format(new Date(selectedAssignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </DialogHeader>
            <Form {...submissionForm}>
              <form onSubmit={submissionForm.handleSubmit(onSubmitAssignment)} className="space-y-4">
                <FormField
                  control={submissionForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your assignment content, answers, or notes here..." 
                          {...field} 
                          data-testid="textarea-assignment-content"
                          className="glass-morphism min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={submissionForm.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Attachments (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            field.onChange(files.map(f => f.name));
                          }}
                          data-testid="input-assignment-files"
                          className="glass-morphism"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSubmitDialogOpen(false)}
                    data-testid="button-cancel-submission"
                  >
                    Cancel
                  </Button>
                  <NeonButton 
                    type="submit" 
                    neon 
                    disabled={submitAssignmentMutation.isPending}
                    data-testid="button-confirm-submission"
                  >
                    {submitAssignmentMutation.isPending ? "Submitting..." : "Submit Assignment"}
                  </NeonButton>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Grade Viewing Dialog */}
        <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
          <DialogContent className="glass-morphism border-neon">
            <DialogHeader>
              <DialogTitle>
                <GradientText>Assignment Grade</GradientText>
              </DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {selectedAssignment.grade || 0}/{selectedAssignment.maxPoints || 100}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${
                          star <= Math.round((selectedAssignment.grade / selectedAssignment.maxPoints) * 5)
                            ? "text-yellow-400 fill-current" 
                            : "text-muted-foreground"
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="text-lg font-semibold">
                    {((selectedAssignment.grade / selectedAssignment.maxPoints) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Assignment</h4>
                    <p className="text-sm text-muted-foreground">{selectedAssignment.title}</p>
                  </div>
                  
                  {selectedAssignment.feedback && (
                    <div>
                      <h4 className="font-semibold mb-1">Teacher Feedback</h4>
                      <div className="p-3 glass-morphism rounded-lg">
                        <p className="text-sm">{selectedAssignment.feedback}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>
                      <p>{selectedAssignment.submittedAt && format(new Date(selectedAssignment.submittedAt), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Graded:</span>
                      <p>{selectedAssignment.gradedAt && format(new Date(selectedAssignment.gradedAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setGradeDialogOpen(false)}
                    data-testid="button-close-grade"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
