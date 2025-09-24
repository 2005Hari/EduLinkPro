import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Role-based routing: redirect users from root path to their appropriate dashboards
  if (path === "/" && user.role) {
    return (
      <Route path={path}>
        {user.role === "teacher" && <Redirect to="/teacher" />}
        {user.role === "parent" && <Redirect to="/parent" />}
        {user.role === "student" && <Component />}
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
