import { useAuth } from "@/hooks/use-auth";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Home,
  BookOpen,
  ClipboardList,
  Calendar,
  TrendingUp,
  Megaphone,
  Heart,
  Settings,
  Users,
  Presentation,
  UserCheck,
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", icon: Home, label: "Dashboard", roles: ["student", "teacher", "parent"] },
      { href: "/assignments", icon: ClipboardList, label: "Assignments", roles: ["student", "teacher"] },
      { href: "/timetable", icon: Calendar, label: "Timetable", roles: ["student", "teacher", "parent"] },
      { href: "/announcements", icon: Megaphone, label: "Announcements", roles: ["student", "teacher", "parent"] },
      { href: "/profile", icon: Settings, label: "Profile", roles: ["student", "teacher", "parent"] },
    ];

    if (user.role === "student") {
      baseItems.splice(1, 0, { href: "/courses", icon: BookOpen, label: "My Courses", roles: ["student"] });
      baseItems.splice(4, 0, { href: "/emotion-monitor", icon: Heart, label: "Wellness", roles: ["student"] });
    }

    if (user.role === "teacher") {
      baseItems.splice(1, 0, { href: "/courses", icon: Presentation, label: "My Courses", roles: ["teacher"] });
      baseItems.splice(4, 0, { href: "/analytics", icon: TrendingUp, label: "Analytics", roles: ["teacher"] });
    }

    if (user.role === "parent") {
      baseItems.splice(1, 0, { href: "/children", icon: Users, label: "Children", roles: ["parent"] });
      baseItems.splice(2, 0, { href: "/progress", icon: TrendingUp, label: "Progress", roles: ["parent"] });
    }

    return baseItems.filter(item => item.roles.includes(user.role));
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="w-64 glass-morphism border-r border-border fixed h-full z-30">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center animate-glow">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">
            <GradientText>EduSphere</GradientText>
          </h1>
        </div>

        {/* User Profile */}
        <GlassCard className="p-4 mb-6 neon-glow" data-testid="user-profile">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.profilePicture || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
                {user.role}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 cursor-pointer",
                    isActive
                      ? "bg-primary/20 text-primary neon-border"
                      : "hover:bg-muted/50"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Role Switch */}
        <GlassCard className="mt-8 p-3">
          <p className="text-xs text-muted-foreground mb-2">Quick Access</p>
          <div className="space-y-2">
            <Link href="/student">
              <div className="flex items-center space-x-2 text-xs p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                <UserCheck className="w-4 h-4" />
                <span>Student View</span>
              </div>
            </Link>
            <Link href="/teacher">
              <div className="flex items-center space-x-2 text-xs p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                <Presentation className="w-4 h-4" />
                <span>Teacher View</span>
              </div>
            </Link>
            <Link href="/parent">
              <div className="flex items-center space-x-2 text-xs p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="w-4 h-4" />
                <span>Parent View</span>
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>
    </aside>
  );
}
