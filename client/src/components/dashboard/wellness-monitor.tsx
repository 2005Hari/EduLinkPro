import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Brain, Camera, Mic, StopCircle, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function WellnessMonitor() {
  const { toast } = useToast();
  const { data: emotions = [] } = useQuery({
    queryKey: ["/api/emotions"],
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const getOverallMood = () => {
    if (emotions.length === 0) return { mood: "Unknown", color: "text-muted-foreground", indicator: "bg-muted" };
    
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast({
        title: "Camera Started",
        description: "Emotion analysis camera is now active",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      toast({
        title: "Camera Stopped",
        description: "Emotion analysis camera has been turned off",
      });
    }
  };

  const startVoiceRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      setAudioStream(mediaStream);
      
      const recorder = new MediaRecorder(mediaStream);
      const audioChunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        console.log('Audio recording saved:', audioBlob);
        // You can send this to the server for emotion analysis
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Voice emotion analysis is now recording",
      });
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      
      toast({
        title: "Recording Stopped",
        description: "Voice recording has been saved",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, audioStream]);

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
            <div className="flex items-center justify-center flex-col space-y-4">
              <div className="text-center">
                <Brain className="text-3xl text-secondary mb-2 mx-auto w-8 h-8" />
                <p className="text-sm text-muted-foreground">AI Emotion Analysis</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monitoring your emotional well-being
                </p>
              </div>
              
              {/* Video Preview */}
              {isCameraActive && (
                <div className="w-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-40 rounded-lg object-cover bg-black"
                    data-testid="wellness-camera-preview"
                  />
                </div>
              )}
              
              {/* Camera and Voice Controls */}
              <div className="flex gap-3 w-full">
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    className="flex-1 gap-2"
                    variant="outline"
                    data-testid="button-start-camera"
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    className="flex-1 gap-2"
                    variant="destructive"
                    data-testid="button-stop-camera"
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop Camera
                  </Button>
                )}
                
                {!isRecording ? (
                  <Button
                    onClick={startVoiceRecording}
                    className="flex-1 gap-2"
                    variant="outline"
                    data-testid="button-start-voice"
                  >
                    <Mic className="h-4 w-4" />
                    Record Voice
                  </Button>
                ) : (
                  <Button
                    onClick={stopVoiceRecording}
                    className="flex-1 gap-2 animate-pulse"
                    variant="destructive"
                    data-testid="button-stop-voice"
                  >
                    <StopCircle className="h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
              </div>
              
              {isRecording && (
                <div className="flex items-center gap-2 text-red-500">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm">Recording in progress...</span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </GlassCard>
  );
}
