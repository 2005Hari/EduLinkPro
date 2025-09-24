import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function PerformanceChart() {
  return (
    <GlassCard className="p-6 neon-glow">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>Performance Analytics</GradientText>
      </h2>
      
      <motion.div
        className="chart-container h-48"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <TrendingUp className="text-4xl text-primary mb-4 mx-auto w-12 h-12" />
            <p className="text-muted-foreground">Performance chart will render here</p>
            <p className="text-xs text-muted-foreground mt-2">
              Integration with Recharts for grade trends over time
            </p>
          </div>
        </div>
      </motion.div>
    </GlassCard>
  );
}
