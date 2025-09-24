import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain,
  Camera,
  Mic,
  Heart,
  Smile,
  Frown,
  Zap,
  Target,
  HelpCircle,
  TrendingUp,
  Save
} from "lucide-react";

export default function EmotionMonitorPage() {
  const { toast } = useToast();
  const [newEmotion, setNewEmotion] = useState({
    emotion: "",
    intensity: [5],
    context: ""
  });

  const { data: emotions = [] } = useQuery({
    queryKey: ["/api/emotions"],
  });

  const recordEmotionMutation = useMutation({
    mutationFn: async (emotionData: any) => {
      const res = await apiRequest("POST", "/api/emotions", {
        ...emotionData,
        intensity: emotionData.intensity[0]
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotions"] });
      setNewEmotion({ emotion: "", intensity: [5], context: "" });
      toast({
        title: "Emotion Recorded",
        description: "Your emotional state has been logged successfully.",
      });
    },
  });

  const emotionIcons = {
    happy: { icon: Smile, color: "text-green-400", bg: "bg-green-400/20" },
    sad: { icon: Frown, color: "text-blue-400", bg: "bg-blue-400/20" },
    stressed: { icon: Zap, color: "text-red-400", bg: "bg-red-400/20" },
    focused: { icon: Target, color: "text-primary", bg: "bg-primary/20" },
    confused: { icon: HelpCircle, color: "text-yellow-400", bg: "bg-yellow-400/20" },
    excited: { icon: TrendingUp, color: "text-accent", bg: "bg-accent/20" },
  };

  const getEmotionStats = () => {
    if (emotions.length === 0) return { dominant: "Unknown", average: 0, trend: "stable" };
    
    const recentEmotions = emotions.slice(0, 10);
    const emotionCounts = recentEmotions.reduce((acc: any, emotion: any) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    ) || "Unknown";
    
    const average = recentEmotions.reduce((sum: number, emotion: any) => sum + emotion.intensity, 0) / recentEmotions.length || 0;
    
    return { dominant, average: Math.round(average), trend: "improving" };
  };

  const stats = getEmotionStats();

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
              <GradientText>Wellness Monitor</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Track your emotional well-being and mental state
            </p>
          </div>
        </div>

        {/* AI Detection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <Brain className="h-6 w-6" />
                AI Emotion Detection
              </GradientText>
            </h2>
            
            <div className="space-y-6">
              {/* Camera Detection */}
              <div className="text-center space-y-4">
                <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="h-12 w-12 mx-auto mb-4" />
                    <p>Camera feed for emotion detection</p>
                    <p className="text-sm opacity-70">Feature ready for AI integration</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <Button className="bg-primary/20 hover:bg-primary/30">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  <Button variant="outline">
                    <Mic className="mr-2 h-4 w-4" />
                    Voice Analysis
                  </Button>
                </div>
              </div>

              {/* Current Detection */}
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">Current Detection</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Emotion</span>
                    <Badge variant="secondary">Analyzing...</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Confidence</span>
                    <span className="text-sm">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stress Level</span>
                    <span className="text-sm">--</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </GlassCard>

          {/* Manual Entry */}
          <GlassCard className="p-6 neon-glow">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText className="flex items-center gap-3">
                <Heart className="h-6 w-6" />
                Manual Entry
              </GradientText>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Emotion</label>
                <Select 
                  value={newEmotion.emotion} 
                  onValueChange={(value) => setNewEmotion(prev => ({ ...prev, emotion: value }))}
                >
                  <SelectTrigger data-testid="select-emotion">
                    <SelectValue placeholder="Select your emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">😊 Happy</SelectItem>
                    <SelectItem value="sad">😢 Sad</SelectItem>
                    <SelectItem value="stressed">😰 Stressed</SelectItem>
                    <SelectItem value="focused">🎯 Focused</SelectItem>
                    <SelectItem value="confused">😕 Confused</SelectItem>
                    <SelectItem value="excited">🚀 Excited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Intensity Level: {newEmotion.intensity[0]}
                </label>
                <Slider
                  value={newEmotion.intensity}
                  onValueChange={(value) => setNewEmotion(prev => ({ ...prev, intensity: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-intensity"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Context (optional)</label>
                <Textarea
                  placeholder="What were you doing? (e.g., studying, taking a break, in class)"
                  value={newEmotion.context}
                  onChange={(e) => setNewEmotion(prev => ({ ...prev, context: e.target.value }))}
                  data-testid="textarea-context"
                />
              </div>

              <Button 
                className="w-full"
                onClick={() => recordEmotionMutation.mutate(newEmotion)}
                disabled={!newEmotion.emotion || recordEmotionMutation.isPending}
                data-testid="button-record-emotion"
              >
                <Save className="mr-2 h-4 w-4" />
                {recordEmotionMutation.isPending ? "Recording..." : "Record Emotion"}
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dominant Emotion</p>
                <p className="text-2xl font-bold text-primary capitalize">{stats.dominant}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Intensity</p>
                <p className="text-2xl font-bold text-secondary">{stats.average}/10</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-accent">{emotions.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-accent" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Emotion History */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Emotion History</GradientText>
          </h2>
          
          <div className="space-y-4">
            {emotions.length > 0 ? (
              emotions.slice(0, 10).map((emotion: any, index: number) => {
                const EmotionIcon = emotionIcons[emotion.emotion as keyof typeof emotionIcons]?.icon || Heart;
                const iconColor = emotionIcons[emotion.emotion as keyof typeof emotionIcons]?.color || "text-primary";
                const iconBg = emotionIcons[emotion.emotion as keyof typeof emotionIcons]?.bg || "bg-primary/20";
                
                return (
                  <motion.div
                    key={emotion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 glass-morphism rounded-lg"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <EmotionIcon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold capitalize">{emotion.emotion}</h3>
                        <Badge variant="outline">Intensity: {emotion.intensity}/10</Badge>
                      </div>
                      {emotion.context && (
                        <p className="text-sm text-muted-foreground mt-1">{emotion.context}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(emotion.detectedAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No emotion data yet</h3>
                <p className="text-muted-foreground">
                  Start tracking your emotions to see insights and patterns.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </MainLayout>
  );
}
