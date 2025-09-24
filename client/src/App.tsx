import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/context/theme-context";
import { WebSocketProvider } from "@/context/websocket-context";
import { ProtectedRoute } from "./lib/protected-route";

import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import CoursePlayer from "@/pages/course-player";
import AssignmentsPage from "@/pages/assignments-page";
import TimetablePage from "@/pages/timetable-page";
import EmotionMonitorPage from "@/pages/emotion-monitor-page";
import NoticesAnnouncements from "@/pages/notices-announcements";
import ProfileSettings from "@/pages/profile-settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={StudentDashboard} />
      <ProtectedRoute path="/student" component={StudentDashboard} />
      <ProtectedRoute path="/teacher" component={TeacherDashboard} />
      <ProtectedRoute path="/parent" component={ParentDashboard} />
      <ProtectedRoute path="/course/:id" component={CoursePlayer} />
      <ProtectedRoute path="/assignments" component={AssignmentsPage} />
      <ProtectedRoute path="/timetable" component={TimetablePage} />
      <ProtectedRoute path="/emotion-monitor" component={EmotionMonitorPage} />
      <ProtectedRoute path="/announcements" component={NoticesAnnouncements} />
      <ProtectedRoute path="/profile" component={ProfileSettings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="edusphere-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
