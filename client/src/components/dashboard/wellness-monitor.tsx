import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function WellnessMonitor() {
  const { data: emotions = [] } = useQuery({
    queryKey: ["/api/emotions"],
  });

  const getOverallMood = () => {
    if (emotions.length === 0) return { mood: "Unknown", color: "text-muted-foreground", indicator: "bg-muted" };
    
    // Simple mood calculation based on recent emotions
    const recentEmotions = emotions.slice(0, 5);
    const positiveEmotions = recentEmotions.filter((e: any) => 
      ["happy", "excited", "focused"].includes(e.emotion)
    );
    
    if (positiveEmotions.length >= 3) {
      return { mood: "Good", color: "text-green-400", indicator: "bg-green-400" };
    } else if (positiveEmotions.length >= 1) {
      return { mood: "Moderate", color: "text-yellow-400", indicator: "bg-yellow-400" };
    } else {
      return { mood: "Needs Attention", color: "text-red-400", indicator: "bg-red-400" };
    }
  };

  const overallMood = getOverallMood();

  const wellnessMetrics = [
    {
      label: "Overall Mood",
      value: overallMood.mood,
      color: overallMood.color,
      indicator: overallMood.indicator
    },
    {
      label: "Focus Level",
      value: "High",
      color: "text-primary",
      indicator: "bg-primary"
    },
    {
      label: "Stress Level",
      value: "Moderate",
      color: "text-yellow-400",
      indicator: "bg-yellow-400"
    }
  ];

  return (
    <GlassCard className="p-6 neon-glow">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>Wellness Monitor</GradientText>
      </h2>
      
      <div className="space-y-4">
        {wellnessMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <span className="text-sm">{metric.label}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${metric.indicator}`}></div>
              <span className={`text-sm ${metric.color}`}>{metric.value}</span>
            </div>
          </motion.div>
        ))}
        
        {/* AI Analysis Section */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Brain className="text-3xl text-secondary mb-2 mx-auto w-8 h-8" />
                <p className="text-sm text-muted-foreground">AI Emotion Analysis</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monitoring your emotional well-being
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </GlassCard>
  );
}
