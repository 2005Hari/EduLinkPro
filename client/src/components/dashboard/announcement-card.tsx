import { GlassCard } from "@/components/ui/glass-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Info, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    authorName?: string;
    courseName?: string;
    createdAt: string;
  };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const getIcon = () => {
    if (announcement.title.toLowerCase().includes('assignment')) {
      return <Megaphone className="text-primary text-sm" />;
    }
    if (announcement.title.toLowerCase().includes('achievement')) {
      return <Trophy className="text-green-400 text-sm" />;
    }
    return <Info className="text-secondary text-sm" />;
  };

  const getIconBg = () => {
    if (announcement.title.toLowerCase().includes('assignment')) {
      return 'bg-primary/20';
    }
    if (announcement.title.toLowerCase().includes('achievement')) {
      return 'bg-green-400/20';
    }
    return 'bg-secondary/20';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-4 hover:neon-border transition-all duration-300">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{announcement.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {announcement.content}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{announcement.authorName || 'System'}</span>
              <span>{formatDistanceToNow(new Date(announcement.createdAt))} ago</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
