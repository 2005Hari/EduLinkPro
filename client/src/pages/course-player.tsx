import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Maximize,
  BookOpen,
  FileText,
  Vote,
  Bookmark,
  Clock,
  CheckCircle
} from "lucide-react";

export default function CoursePlayer() {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Course Header */}
        <GlassCard className="p-6 neon-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                <GradientText>Advanced React Development</GradientText>
              </h1>
              <p className="text-muted-foreground">Module 3: State Management with Context API</p>
            </div>
            <Badge variant="secondary">75% Complete</Badge>
          </div>
          <Progress value={75} className="h-2" />
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6 neon-glow">
              {/* Video Container */}
              <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white mb-4" />
                  <p className="text-white">Video content would load here</p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between p-4 glass-morphism rounded-lg">
                <div className="flex items-center space-x-4">
                  <Button size="sm" variant="outline">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">12:34 / 45:20</span>
                  <Button size="sm" variant="outline">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Course Content Tabs */}
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="quiz">Vote</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <GlassCard className="p-4">
                    <h3 className="font-semibold mb-2">About this lesson</h3>
                    <p className="text-sm text-muted-foreground">
                      In this lesson, we'll explore the Context API in React and learn how to manage state 
                      across multiple components without prop drilling. We'll build a practical example 
                      that demonstrates the power of React's built-in state management solution.
                    </p>
                  </GlassCard>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-6">
                  <GlassCard className="p-4">
                    <h3 className="font-semibold mb-2">Your Notes</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-2 glass-morphism rounded">
                        <Clock className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm">Context API is great for avoiding prop drilling</p>
                          <p className="text-xs text-muted-foreground">at 5:23</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 glass-morphism rounded">
                        <Bookmark className="h-4 w-4 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm">Remember to use useContext hook</p>
                          <p className="text-xs text-muted-foreground">at 12:45</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>
                
                <TabsContent value="quiz" className="mt-6">
                  <GlassCard className="p-4">
                    <h3 className="font-semibold mb-2">Knowledge Check</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Test your understanding of the Context API concepts covered in this lesson.
                    </p>
                    <Button>
                      <Vote className="mr-2 h-4 w-4" />
                      Start Vote
                    </Button>
                  </GlassCard>
                </TabsContent>
                
                <TabsContent value="resources" className="mt-6">
                  <GlassCard className="p-4">
                    <h3 className="font-semibold mb-2">Additional Resources</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 glass-morphism rounded hover:neon-border transition-all cursor-pointer">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">React Context API Documentation</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 glass-morphism rounded hover:neon-border transition-all cursor-pointer">
                        <BookOpen className="h-4 w-4 text-secondary" />
                        <span className="text-sm">State Management Best Practices</span>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>
              </Tabs>
            </GlassCard>
          </div>

          {/* Course Playlist */}
          <div>
            <GlassCard className="p-6 neon-glow">
              <h3 className="font-semibold mb-4">
                <GradientText>Course Content</GradientText>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 glass-morphism rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Introduction to React</p>
                    <p className="text-xs text-muted-foreground">15 min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-morphism rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Components & Props</p>
                    <p className="text-xs text-muted-foreground">25 min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-morphism rounded-lg neon-border">
                  <Play className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">State Management</p>
                    <p className="text-xs text-muted-foreground">45 min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-morphism rounded-lg opacity-50">
                  <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Effects & Lifecycle</p>
                    <p className="text-xs text-muted-foreground">30 min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-morphism rounded-lg opacity-50">
                  <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Custom Hooks</p>
                    <p className="text-xs text-muted-foreground">20 min</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
