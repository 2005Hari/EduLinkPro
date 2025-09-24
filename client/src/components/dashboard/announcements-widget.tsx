import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NeonButton } from "@/components/ui/neon-button";
import { AnnouncementCard } from "./announcement-card";
import { Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName?: string;
  courseName?: string;
  createdAt: string;
}

interface AnnouncementsWidgetProps {
  announcements: Announcement[];
  limit?: number;
}

export function AnnouncementsWidget({ announcements, limit = 3 }: AnnouncementsWidgetProps) {
  const recentAnnouncements = announcements.slice(0, limit);

  return (
    <GlassCard className="p-6 neon-glow">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>Recent Announcements</GradientText>
      </h2>
      <div className="space-y-4">
        {recentAnnouncements.length > 0 ? (
          recentAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        )}
      </div>
      <NeonButton className="w-full mt-6" variant="outline" neon>
        View All Announcements
      </NeonButton>
    </GlassCard>
  );
}
