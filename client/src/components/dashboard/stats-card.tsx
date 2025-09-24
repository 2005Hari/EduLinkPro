import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/20",
    secondary: "text-secondary bg-secondary/20",
    accent: "text-accent bg-accent/20",
    green: "text-green-400 bg-green-400/20",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-6 neon-glow hover:neon-border transition-all duration-300 animate-float">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[0] || 'text-primary'}`}>
              {value}
            </p>
            <p className="text-sm text-muted-foreground">{title}</p>
            {trend && (
              <p className="text-xs text-green-400 mt-1">
                {trend} from last week
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || 'text-primary bg-primary/20'}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
